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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prds_user_id ON prds(user_id);

-- One row per past version of a PRD's content, pushed by editPRDHandler
-- before it overwrites content. undoPRDHandler pops the most recent row
-- (highest id) to restore it, giving multi-level undo.
CREATE TABLE prd_revisions (
    id BIGSERIAL PRIMARY KEY,
    prd_id BIGINT NOT NULL REFERENCES prds(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prd_revisions_prd_id ON prd_revisions(prd_id, id DESC);
