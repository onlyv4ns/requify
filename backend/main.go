package main

import (
	"bufio"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/anthropics/anthropic-sdk-go"
	_ "github.com/jackc/pgx/v5/stdlib"
)

var db *sql.DB

// parseEnvFile reads KEY=VALUE pairs from the given .env file, if it exists.
// Kept dependency-free since this is the only thing we need from a full .env
// library.
func parseEnvFile(path string) map[string]string {
	vars := map[string]string{}
	f, err := os.Open(path)
	if err != nil {
		return vars
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		vars[strings.TrimSpace(key)] = strings.Trim(strings.TrimSpace(value), `"'`)
	}
	return vars
}

// loadEnvFile sets process env vars from the given .env file, without
// overriding variables already set in the real environment.
func loadEnvFile(path string) {
	for key, value := range parseEnvFile(path) {
		if _, exists := os.LookupEnv(key); exists {
			continue
		}
		os.Setenv(key, value)
	}
}

// envFile re-reads key straight from .env on every call, so editing the file
// takes effect on the next request with no server restart. Falls back to the
// process environment if the file doesn't define it.
// ponytail: re-reads and re-parses the whole file per call — fine at this
// request rate, switch to fsnotify + cache if PRD generation becomes hot.
func envFile(key string) string {
	if v, ok := parseEnvFile(".env")[key]; ok {
		return v
	}
	return os.Getenv(key)
}

func main() {
	loadEnvFile(".env")

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://requify:requify@localhost:5432/requify?sslmode=disable"
	}

	var err error
	db, err = sql.Open("pgx", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if os.Getenv("ANTHROPIC_API_KEY") == "" {
		log.Println("warning: ANTHROPIC_API_KEY not set, PRD generation will fail")
	}
	ai := anthropic.NewClient()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", healthHandler)
	mux.HandleFunc("POST /api/auth/register", registerHandler)
	mux.HandleFunc("POST /api/auth/login", loginHandler)
	mux.HandleFunc("POST /api/auth/logout", logoutHandler)
	mux.HandleFunc("GET /api/auth/me", meHandler)
	mux.HandleFunc("POST /api/prds", requireAuth(generatePRDHandler(ai)))
	mux.HandleFunc("GET /api/prds", requireAuth(listPRDsHandler))
	mux.HandleFunc("GET /api/prds/{id}", requireAuth(getPRDHandler))
	mux.HandleFunc("PATCH /api/prds/{id}", requireAuth(editPRDHandler(ai)))
	mux.HandleFunc("POST /api/prds/{id}/undo", requireAuth(undoPRDHandler))
	mux.HandleFunc("POST /api/prds/{id}/ask", requireAuth(askPRDHandler(ai)))
	mux.HandleFunc("DELETE /api/prds/{id}", requireAuth(deletePRDHandler))

	frontendOrigin := os.Getenv("FRONTEND_ORIGIN")
	if frontendOrigin == "" {
		frontendOrigin = "http://localhost:3000"
	}

	log.Println("requify backend listening on :8080")
	if err := http.ListenAndServe(":8080", withCORS(frontendOrigin, mux)); err != nil {
		log.Fatal(err)
	}
}

// withCORS lets the frontend call this API directly (cross-origin,
// credentials included) instead of going through a dev-server proxy —
// needed because claude_code generation can run well past typical proxy
// timeouts.
func withCORS(origin string, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		h.ServeHTTP(w, r)
	})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	status := "ok"
	if err := db.Ping(); err != nil {
		status = "db_unreachable"
	}
	json.NewEncoder(w).Encode(map[string]string{"status": status})
}
