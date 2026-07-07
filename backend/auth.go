package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var authSecret []byte

func init() {
	if s := os.Getenv("AUTH_SECRET"); s != "" {
		authSecret = []byte(s)
		return
	}
	authSecret = make([]byte, 32)
	if _, err := rand.Read(authSecret); err != nil {
		log.Fatal("failed to generate auth secret:", err)
	}
	log.Println("warning: AUTH_SECRET not set, using a random secret — sessions will not survive a restart")
}

const sessionCookieName = "requify_session"
const sessionTTL = 7 * 24 * time.Hour

// signSession builds an opaque "payload.signature" token (HMAC-SHA256) —
// enough for a single-service session without pulling in a JWT dependency.
func signSession(userID int64) string {
	payload := fmt.Sprintf("%d.%d", userID, time.Now().Add(sessionTTL).Unix())
	mac := hmac.New(sha256.New, authSecret)
	mac.Write([]byte(payload))
	sig := mac.Sum(nil)
	return base64.RawURLEncoding.EncodeToString([]byte(payload)) + "." + base64.RawURLEncoding.EncodeToString(sig)
}

func verifySession(token string) (int64, bool) {
	parts := strings.SplitN(token, ".", 2)
	if len(parts) != 2 {
		return 0, false
	}
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return 0, false
	}
	sig, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return 0, false
	}
	mac := hmac.New(sha256.New, authSecret)
	mac.Write(payloadBytes)
	if !hmac.Equal(sig, mac.Sum(nil)) {
		return 0, false
	}

	fields := strings.SplitN(string(payloadBytes), ".", 2)
	if len(fields) != 2 {
		return 0, false
	}
	userID, err := strconv.ParseInt(fields[0], 10, 64)
	if err != nil {
		return 0, false
	}
	exp, err := strconv.ParseInt(fields[1], 10, 64)
	if err != nil || time.Now().Unix() > exp {
		return 0, false
	}
	return userID, true
}

func setSessionCookie(w http.ResponseWriter, userID int64) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    signSession(userID),
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(sessionTTL.Seconds()),
	})
}

func clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

func currentUserID(r *http.Request) (int64, bool) {
	c, err := r.Cookie(sessionCookieName)
	if err != nil {
		return 0, false
	}
	return verifySession(c.Value)
}

// requireAuth wraps a handler that needs the caller's user id, rejecting the
// request with 401 if there's no valid session cookie.
func requireAuth(next func(w http.ResponseWriter, r *http.Request, userID int64)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := currentUserID(r)
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		next(w, r, userID)
	}
}

type authUser struct {
	ID    int64  `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil ||
		req.Email == "" || req.Password == "" || req.Name == "" {
		http.Error(w, "email, password, and name are required", http.StatusBadRequest)
		return
	}
	if len(req.Password) < 8 {
		http.Error(w, "password must be at least 8 characters", http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "failed to process password", http.StatusInternalServerError)
		return
	}

	var u authUser
	err = db.QueryRowContext(r.Context(),
		`INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name`,
		req.Email, string(hash), req.Name,
	).Scan(&u.ID, &u.Email, &u.Name)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			http.Error(w, "email already registered", http.StatusConflict)
			return
		}
		log.Println("register error:", err)
		http.Error(w, "failed to register", http.StatusInternalServerError)
		return
	}

	setSessionCookie(w, u.ID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Email == "" || req.Password == "" {
		http.Error(w, "email and password are required", http.StatusBadRequest)
		return
	}

	var u authUser
	var hash string
	err := db.QueryRowContext(r.Context(),
		`SELECT id, email, name, password_hash FROM users WHERE email = $1`, req.Email,
	).Scan(&u.ID, &u.Email, &u.Name, &hash)
	if err == sql.ErrNoRows || bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
		http.Error(w, "invalid email or password", http.StatusUnauthorized)
		return
	} else if err != nil {
		log.Println("login error:", err)
		http.Error(w, "failed to login", http.StatusInternalServerError)
		return
	}

	setSessionCookie(w, u.ID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	clearSessionCookie(w)
	w.WriteHeader(http.StatusNoContent)
}

func meHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := currentUserID(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var u authUser
	err := db.QueryRowContext(r.Context(),
		`SELECT id, email, name FROM users WHERE id = $1`, userID,
	).Scan(&u.ID, &u.Email, &u.Name)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}
