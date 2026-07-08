package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
)

const prdSystemPrompt = `You are a product manager writing a Product Requirements Document (PRD) in Markdown, in English.

Given a short description of an application, write a complete PRD with exactly these sections, in this order:

## 1. Overview
## 2. Requirements
## 3. Core Features
## 4. User Flow
## 5. Architecture
(include a mermaid sequenceDiagram showing the main data flow)
## 6. Database Schema
(include a mermaid erDiagram plus a markdown table describing each entity)
## 7. Design & Technical Constraints

If the user specifies a required tech stack (frontend, backend, database, and/or deployment), use it as-is in section 7 and make sure the Architecture diagram (section 5) and Database Schema (section 6) are consistent with it. Otherwise choose the stack yourself. Either way, always use the latest stable version of each technology (e.g. the newest major release of the framework/language/runtime as of your knowledge) and name that version explicitly in section 7 — never default to an older or unspecified version.

Output only the Markdown document, starting with "# PRD — Project Requirements Document". Do not wrap it in a code fence. Do not add any commentary before or after.`

const prdEditSystemPrompt = `You are a product manager editing an existing Product Requirements Document (PRD) written in Markdown, in English.

You will be given the current PRD content and an instruction describing the change to make. Apply the instruction and output the full, updated PRD in the same format (same section structure, mermaid diagrams where present). When the tech stack is touched, always use the latest stable version of each technology and name it explicitly. Output only the Markdown document. Do not wrap it in a code fence. Do not add any commentary before or after.`

const prdAskSystemPrompt = `You are a product manager answering questions about an existing Product Requirements Document (PRD), in English.

You will be given the current PRD content and a question about it. Answer the question directly, referring to the relevant sections of the PRD. Do not rewrite or output the PRD itself — only the answer, in plain Markdown text.`

type editPRDRequest struct {
	Instruction string `json:"instruction"`
	Provider    string `json:"provider"`
}

type askPRDRequest struct {
	Question string `json:"question"`
	Provider string `json:"provider"`
}

type generatePRDRequest struct {
	Title      string `json:"title"`
	Prompt     string `json:"prompt"`
	Provider   string `json:"provider"`
	Frontend   string `json:"frontend"`
	Backend    string `json:"backend"`
	Database   string `json:"database"`
	Deployment string `json:"deployment"`
}

type prd struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	Title      string    `json:"title"`
	Prompt     string    `json:"prompt"`
	Frontend   string    `json:"frontend"`
	Backend    string    `json:"backend"`
	Database   string    `json:"database"`
	Deployment string    `json:"deployment"`
	Content    string    `json:"content"`
	ShareToken *string   `json:"share_token"`
	CanUndo    bool      `json:"can_undo"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func buildModelPrompt(prompt, frontend, backend, database, deployment string) string {
	if frontend == "" && backend == "" && database == "" && deployment == "" {
		return prompt
	}
	var sb strings.Builder
	sb.WriteString(prompt)
	sb.WriteString("\n\nRequired tech stack:\n")
	if frontend != "" {
		fmt.Fprintf(&sb, "- Frontend: %s\n", frontend)
	}
	if backend != "" {
		fmt.Fprintf(&sb, "- Backend: %s\n", backend)
	}
	if database != "" {
		fmt.Fprintf(&sb, "- Database: %s\n", database)
	}
	if deployment != "" {
		fmt.Fprintf(&sb, "- Deployment: %s\n", deployment)
	}
	return sb.String()
}

func generatePRDHandler(ai anthropic.Client) func(w http.ResponseWriter, r *http.Request, userID int64) {
	return func(w http.ResponseWriter, r *http.Request, userID int64) {
		var req generatePRDRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Title == "" || req.Prompt == "" {
			http.Error(w, "title and prompt are required", http.StatusBadRequest)
			return
		}

		modelPrompt := buildModelPrompt(req.Prompt, req.Frontend, req.Backend, req.Database, req.Deployment)

		var content string
		var err error
		if req.Provider == "claude_code" {
			content, err = generateWithClaudeCode(r.Context(), prdSystemPrompt, modelPrompt)
		} else {
			content, err = generateWithAPI(r.Context(), ai, prdSystemPrompt, modelPrompt)
		}
		if err != nil {
			log.Println("generate error:", err)
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		var p prd
		err = db.QueryRowContext(r.Context(),
			`INSERT INTO prds (user_id, title, prompt, frontend_stack, backend_stack, database_stack, deployment_stack, content)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			 RETURNING id, user_id, title, prompt, frontend_stack, backend_stack, database_stack, deployment_stack, content, created_at, updated_at`,
			userID, req.Title, req.Prompt, req.Frontend, req.Backend, req.Database, req.Deployment, content,
		).Scan(&p.ID, &p.UserID, &p.Title, &p.Prompt, &p.Frontend, &p.Backend, &p.Database, &p.Deployment, &p.Content, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			log.Println("db insert error:", err)
			http.Error(w, "failed to save PRD", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(p)
	}
}

func generateWithAPI(ctx context.Context, ai anthropic.Client, systemPrompt, prompt string) (string, error) {
	model := anthropic.Model(envFile("ANTHROPIC_MODEL"))
	if model == "" {
		model = anthropic.ModelClaudeOpus4_8
	}
	resp, err := ai.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     model,
		MaxTokens: 8000,
		System: []anthropic.TextBlockParam{
			{Text: systemPrompt},
		},
		Messages: []anthropic.MessageParam{
			anthropic.NewUserMessage(anthropic.NewTextBlock(prompt)),
		},
	})
	if err != nil {
		return "", fmt.Errorf("anthropic api: %w", err)
	}

	for _, block := range resp.Content {
		if b, ok := block.AsAny().(anthropic.TextBlock); ok {
			return b.Text, nil
		}
	}
	return "", fmt.Errorf("empty response from model")
}

func generateWithClaudeCode(ctx context.Context, systemPrompt, prompt string) (string, error) {
	if _, err := exec.LookPath("claude"); err != nil {
		return "", fmt.Errorf("claude code CLI not found on this server")
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Minute)
	defer cancel()

	args := []string{"-p", "--output-format", "text", "--system-prompt", systemPrompt}
	if model := envFile("CLAUDE_CODE_MODEL"); model != "" {
		args = append(args, "--model", model)
	}
	cmd := exec.CommandContext(ctx, "claude", append(args, prompt)...)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("claude code: %v: %s", err, strings.TrimSpace(stderr.String()))
	}

	content := strings.TrimSpace(stdout.String())
	if content == "" {
		return "", fmt.Errorf("empty response from claude code")
	}
	return content, nil
}

const prdSelectColumns = `p.id, p.user_id, p.title, p.prompt, p.frontend_stack, p.backend_stack, p.database_stack, p.deployment_stack, p.content, p.share_token,
		 EXISTS(SELECT 1 FROM prd_revisions r WHERE r.prd_id = p.id), p.created_at, p.updated_at`

func scanPRD(row interface{ Scan(...any) error }, p *prd) error {
	return row.Scan(&p.ID, &p.UserID, &p.Title, &p.Prompt, &p.Frontend, &p.Backend, &p.Database, &p.Deployment, &p.Content, &p.ShareToken, &p.CanUndo, &p.CreatedAt, &p.UpdatedAt)
}

func listPRDsHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	rows, err := db.QueryContext(r.Context(),
		`SELECT `+prdSelectColumns+`
		 FROM prds p WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
		userID)
	if err != nil {
		http.Error(w, "failed to list PRDs", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	list := []prd{}
	for rows.Next() {
		var p prd
		if err := scanPRD(rows, &p); err != nil {
			http.Error(w, "failed to read PRDs", http.StatusInternalServerError)
			return
		}
		list = append(list, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

func getPRDHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	id := r.PathValue("id")
	var p prd
	err := scanPRD(db.QueryRowContext(r.Context(),
		`SELECT `+prdSelectColumns+`
		 FROM prds p WHERE p.id = $1 AND p.user_id = $2`, id, userID,
	), &p)
	if err == sql.ErrNoRows {
		http.Error(w, "not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "failed to get PRD", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func deletePRDHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	id := r.PathValue("id")
	res, err := db.ExecContext(r.Context(),
		`DELETE FROM prds WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		http.Error(w, "failed to delete PRD", http.StatusInternalServerError)
		return
	}
	if n, _ := res.RowsAffected(); n == 0 {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func editPRDHandler(ai anthropic.Client) func(w http.ResponseWriter, r *http.Request, userID int64) {
	return func(w http.ResponseWriter, r *http.Request, userID int64) {
		var req editPRDRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Instruction == "" {
			http.Error(w, "instruction is required", http.StatusBadRequest)
			return
		}

		id := r.PathValue("id")
		var currentContent string
		err := db.QueryRowContext(r.Context(),
			`SELECT content FROM prds WHERE id = $1 AND user_id = $2`, id, userID,
		).Scan(&currentContent)
		if err == sql.ErrNoRows {
			http.Error(w, "not found", http.StatusNotFound)
			return
		} else if err != nil {
			http.Error(w, "failed to load PRD", http.StatusInternalServerError)
			return
		}

		editPrompt := fmt.Sprintf("Current PRD:\n\n%s\n\nInstruction: %s", currentContent, req.Instruction)

		var newContent string
		if req.Provider == "claude_code" {
			newContent, err = generateWithClaudeCode(r.Context(), prdEditSystemPrompt, editPrompt)
		} else {
			newContent, err = generateWithAPI(r.Context(), ai, prdEditSystemPrompt, editPrompt)
		}
		if err != nil {
			log.Println("edit error:", err)
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		tx, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			http.Error(w, "failed to save PRD", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback()

		if _, err := tx.ExecContext(r.Context(),
			`INSERT INTO prd_revisions (prd_id, content) SELECT id, content FROM prds WHERE id = $1 AND user_id = $2`,
			id, userID,
		); err != nil {
			log.Println("db revision insert error:", err)
			http.Error(w, "failed to save PRD", http.StatusInternalServerError)
			return
		}

		var p prd
		err = tx.QueryRowContext(r.Context(),
			`UPDATE prds SET content = $1, updated_at = now() WHERE id = $2 AND user_id = $3
			 RETURNING id, user_id, title, prompt, frontend_stack, backend_stack, database_stack, deployment_stack, content, share_token, created_at, updated_at`,
			newContent, id, userID,
		).Scan(&p.ID, &p.UserID, &p.Title, &p.Prompt, &p.Frontend, &p.Backend, &p.Database, &p.Deployment, &p.Content, &p.ShareToken, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			log.Println("db update error:", err)
			http.Error(w, "failed to save PRD", http.StatusInternalServerError)
			return
		}
		if err := tx.Commit(); err != nil {
			http.Error(w, "failed to save PRD", http.StatusInternalServerError)
			return
		}
		p.CanUndo = true

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(p)
	}
}

func undoPRDHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	id := r.PathValue("id")

	tx, err := db.BeginTx(r.Context(), nil)
	if err != nil {
		http.Error(w, "failed to undo", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	var revisionID int64
	var revisionContent string
	err = tx.QueryRowContext(r.Context(),
		`SELECT r.id, r.content FROM prd_revisions r
		 JOIN prds p ON p.id = r.prd_id
		 WHERE r.prd_id = $1 AND p.user_id = $2
		 ORDER BY r.id DESC LIMIT 1`,
		id, userID,
	).Scan(&revisionID, &revisionContent)
	if err == sql.ErrNoRows {
		http.Error(w, "nothing to undo", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "failed to undo", http.StatusInternalServerError)
		return
	}

	if _, err := tx.ExecContext(r.Context(), `DELETE FROM prd_revisions WHERE id = $1`, revisionID); err != nil {
		http.Error(w, "failed to undo", http.StatusInternalServerError)
		return
	}

	var p prd
	err = tx.QueryRowContext(r.Context(),
		`UPDATE prds SET content = $1, updated_at = now() WHERE id = $2 AND user_id = $3
		 RETURNING id, user_id, title, prompt, frontend_stack, backend_stack, database_stack, deployment_stack, content, share_token, created_at, updated_at`,
		revisionContent, id, userID,
	).Scan(&p.ID, &p.UserID, &p.Title, &p.Prompt, &p.Frontend, &p.Backend, &p.Database, &p.Deployment, &p.Content, &p.ShareToken, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		http.Error(w, "failed to undo", http.StatusInternalServerError)
		return
	}

	if err := tx.QueryRowContext(r.Context(),
		`SELECT EXISTS(SELECT 1 FROM prd_revisions WHERE prd_id = $1)`, id,
	).Scan(&p.CanUndo); err != nil {
		http.Error(w, "failed to undo", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "failed to undo", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func askPRDHandler(ai anthropic.Client) func(w http.ResponseWriter, r *http.Request, userID int64) {
	return func(w http.ResponseWriter, r *http.Request, userID int64) {
		var req askPRDRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Question == "" {
			http.Error(w, "question is required", http.StatusBadRequest)
			return
		}

		id := r.PathValue("id")
		var content string
		err := db.QueryRowContext(r.Context(),
			`SELECT content FROM prds WHERE id = $1 AND user_id = $2`, id, userID,
		).Scan(&content)
		if err == sql.ErrNoRows {
			http.Error(w, "not found", http.StatusNotFound)
			return
		} else if err != nil {
			http.Error(w, "failed to load PRD", http.StatusInternalServerError)
			return
		}

		askPrompt := fmt.Sprintf("Current PRD:\n\n%s\n\nQuestion: %s", content, req.Question)

		var answer string
		if req.Provider == "claude_code" {
			answer, err = generateWithClaudeCode(r.Context(), prdAskSystemPrompt, askPrompt)
		} else {
			answer, err = generateWithAPI(r.Context(), ai, prdAskSystemPrompt, askPrompt)
		}
		if err != nil {
			log.Println("ask error:", err)
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"answer": answer})
	}
}

type revisionSummary struct {
	ID        int64     `json:"id"`
	CreatedAt time.Time `json:"created_at"`
}

type revisionDetail struct {
	ID        int64     `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

func listRevisionsHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	id := r.PathValue("id")
	rows, err := db.QueryContext(r.Context(),
		`SELECT r.id, r.created_at FROM prd_revisions r
		 JOIN prds p ON p.id = r.prd_id
		 WHERE r.prd_id = $1 AND p.user_id = $2
		 ORDER BY r.id DESC`, id, userID)
	if err != nil {
		http.Error(w, "failed to list revisions", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	list := []revisionSummary{}
	for rows.Next() {
		var rv revisionSummary
		if err := rows.Scan(&rv.ID, &rv.CreatedAt); err != nil {
			http.Error(w, "failed to read revisions", http.StatusInternalServerError)
			return
		}
		list = append(list, rv)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(list)
}

func getRevisionHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	id := r.PathValue("id")
	revisionID := r.PathValue("revisionId")

	var rv revisionDetail
	err := db.QueryRowContext(r.Context(),
		`SELECT r.id, r.content, r.created_at FROM prd_revisions r
		 JOIN prds p ON p.id = r.prd_id
		 WHERE r.id = $1 AND r.prd_id = $2 AND p.user_id = $3`,
		revisionID, id, userID,
	).Scan(&rv.ID, &rv.Content, &rv.CreatedAt)
	if err == sql.ErrNoRows {
		http.Error(w, "not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "failed to load revision", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rv)
}

func restoreRevisionHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	id := r.PathValue("id")
	revisionID := r.PathValue("revisionId")

	var revisionContent string
	err := db.QueryRowContext(r.Context(),
		`SELECT r.content FROM prd_revisions r
		 JOIN prds p ON p.id = r.prd_id
		 WHERE r.id = $1 AND r.prd_id = $2 AND p.user_id = $3`,
		revisionID, id, userID,
	).Scan(&revisionContent)
	if err == sql.ErrNoRows {
		http.Error(w, "not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "failed to load revision", http.StatusInternalServerError)
		return
	}

	tx, err := db.BeginTx(r.Context(), nil)
	if err != nil {
		http.Error(w, "failed to restore", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(r.Context(),
		`INSERT INTO prd_revisions (prd_id, content) SELECT id, content FROM prds WHERE id = $1 AND user_id = $2`,
		id, userID,
	); err != nil {
		http.Error(w, "failed to restore", http.StatusInternalServerError)
		return
	}

	var p prd
	err = tx.QueryRowContext(r.Context(),
		`UPDATE prds SET content = $1, updated_at = now() WHERE id = $2 AND user_id = $3
		 RETURNING id, user_id, title, prompt, frontend_stack, backend_stack, database_stack, deployment_stack, content, share_token, created_at, updated_at`,
		revisionContent, id, userID,
	).Scan(&p.ID, &p.UserID, &p.Title, &p.Prompt, &p.Frontend, &p.Backend, &p.Database, &p.Deployment, &p.Content, &p.ShareToken, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		http.Error(w, "failed to restore", http.StatusInternalServerError)
		return
	}
	if err := tx.Commit(); err != nil {
		http.Error(w, "failed to restore", http.StatusInternalServerError)
		return
	}
	p.CanUndo = true

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func duplicatePRDHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	id := r.PathValue("id")
	var p prd
	err := db.QueryRowContext(r.Context(),
		`INSERT INTO prds (user_id, title, prompt, frontend_stack, backend_stack, database_stack, deployment_stack, content)
		 SELECT user_id, title || ' (Copy)', prompt, frontend_stack, backend_stack, database_stack, deployment_stack, content
		 FROM prds WHERE id = $1 AND user_id = $2
		 RETURNING id, user_id, title, prompt, frontend_stack, backend_stack, database_stack, deployment_stack, content, created_at, updated_at`,
		id, userID,
	).Scan(&p.ID, &p.UserID, &p.Title, &p.Prompt, &p.Frontend, &p.Backend, &p.Database, &p.Deployment, &p.Content, &p.CreatedAt, &p.UpdatedAt)
	if err == sql.ErrNoRows {
		http.Error(w, "not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "failed to duplicate PRD", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func generateShareToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func sharePRDHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	id := r.PathValue("id")

	var existing sql.NullString
	err := db.QueryRowContext(r.Context(),
		`SELECT share_token FROM prds WHERE id = $1 AND user_id = $2`, id, userID,
	).Scan(&existing)
	if err == sql.ErrNoRows {
		http.Error(w, "not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "failed to share PRD", http.StatusInternalServerError)
		return
	}
	if existing.Valid {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"share_token": existing.String})
		return
	}

	token, err := generateShareToken()
	if err != nil {
		http.Error(w, "failed to share PRD", http.StatusInternalServerError)
		return
	}
	if _, err := db.ExecContext(r.Context(),
		`UPDATE prds SET share_token = $1 WHERE id = $2 AND user_id = $3`, token, id, userID,
	); err != nil {
		http.Error(w, "failed to share PRD", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"share_token": token})
}

func unsharePRDHandler(w http.ResponseWriter, r *http.Request, userID int64) {
	id := r.PathValue("id")
	res, err := db.ExecContext(r.Context(),
		`UPDATE prds SET share_token = NULL WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		http.Error(w, "failed to unshare PRD", http.StatusInternalServerError)
		return
	}
	if n, _ := res.RowsAffected(); n == 0 {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func getPublicPRDHandler(w http.ResponseWriter, r *http.Request) {
	token := r.PathValue("token")
	var p prd
	err := scanPRD(db.QueryRowContext(r.Context(),
		`SELECT `+prdSelectColumns+` FROM prds p WHERE p.share_token = $1`, token,
	), &p)
	if err == sql.ErrNoRows {
		http.Error(w, "not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "failed to load PRD", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}
