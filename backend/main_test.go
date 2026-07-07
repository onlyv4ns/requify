package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadEnvFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, ".env")
	err := os.WriteFile(path, []byte(`
# comment line, should be skipped
ANTHROPIC_MODEL=claude-opus-4-8
QUOTED_VALUE="hello world"
ALREADY_SET=from-file
`), 0644)
	if err != nil {
		t.Fatal(err)
	}

	t.Setenv("ALREADY_SET", "from-real-env")
	os.Unsetenv("ANTHROPIC_MODEL")
	os.Unsetenv("QUOTED_VALUE")
	t.Cleanup(func() {
		os.Unsetenv("ANTHROPIC_MODEL")
		os.Unsetenv("QUOTED_VALUE")
	})

	loadEnvFile(path)

	if got := os.Getenv("ANTHROPIC_MODEL"); got != "claude-opus-4-8" {
		t.Errorf("ANTHROPIC_MODEL = %q, want claude-opus-4-8", got)
	}
	if got := os.Getenv("QUOTED_VALUE"); got != "hello world" {
		t.Errorf("QUOTED_VALUE = %q, want %q", got, "hello world")
	}
	if got := os.Getenv("ALREADY_SET"); got != "from-real-env" {
		t.Errorf("ALREADY_SET = %q, want from-real-env (real env must win over .env file)", got)
	}
}

func TestLoadEnvFileMissing(t *testing.T) {
	loadEnvFile(filepath.Join(t.TempDir(), "does-not-exist.env"))
}

func TestEnvFilePicksUpChangesWithoutRestart(t *testing.T) {
	t.Chdir(t.TempDir())
	envPath := ".env"

	os.WriteFile(envPath, []byte("ANTHROPIC_MODEL=claude-sonnet-5\n"), 0644)
	if got := envFile("ANTHROPIC_MODEL"); got != "claude-sonnet-5" {
		t.Errorf("ANTHROPIC_MODEL = %q, want claude-sonnet-5", got)
	}

	os.WriteFile(envPath, []byte("ANTHROPIC_MODEL=claude-opus-4-8\n"), 0644)
	if got := envFile("ANTHROPIC_MODEL"); got != "claude-opus-4-8" {
		t.Errorf("ANTHROPIC_MODEL = %q, want claude-opus-4-8 after editing .env (no restart)", got)
	}
}
