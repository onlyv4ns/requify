CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prds (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    frontend_stack TEXT NOT NULL DEFAULT '',
    backend_stack TEXT NOT NULL DEFAULT '',
    database_stack TEXT NOT NULL DEFAULT '',
    deployment_stack TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    previous_content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prds_user_id ON prds(user_id);
