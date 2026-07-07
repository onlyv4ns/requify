package main

import "testing"

func TestSignVerifySessionRoundTrip(t *testing.T) {
	authSecret = []byte("test-secret")

	token := signSession(42)
	userID, ok := verifySession(token)
	if !ok || userID != 42 {
		t.Fatalf("expected valid session for user 42, got userID=%d ok=%v", userID, ok)
	}
}

func TestVerifySessionRejectsTamperedToken(t *testing.T) {
	authSecret = []byte("test-secret")

	token := signSession(42)
	tampered := token[:len(token)-1] + "x"
	if _, ok := verifySession(tampered); ok {
		t.Fatal("expected tampered token to be rejected")
	}
}

func TestVerifySessionRejectsWrongSecret(t *testing.T) {
	authSecret = []byte("secret-a")
	token := signSession(42)

	authSecret = []byte("secret-b")
	if _, ok := verifySession(token); ok {
		t.Fatal("expected token signed with a different secret to be rejected")
	}
}

func TestVerifySessionRejectsGarbage(t *testing.T) {
	authSecret = []byte("test-secret")

	if _, ok := verifySession("not-a-valid-token"); ok {
		t.Fatal("expected malformed token to be rejected")
	}
}
