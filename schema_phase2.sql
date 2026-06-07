-- Phase 2: Assessment System PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Test Sessions
CREATE TABLE test_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    type        VARCHAR(20) NOT NULL CHECK (type IN ('mock', 'sectional', 'daily')),
    subject     VARCHAR(100),
    time_limit  INT NOT NULL,
    started_at  TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- Test Answers (per question per session)
CREATE TABLE test_answers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id   UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
    question_id  VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    user_answer  VARCHAR(50),
    correct_ans  VARCHAR(50) NOT NULL,
    is_correct   BOOLEAN,
    time_taken   INT DEFAULT 0
);

-- Test Results
CREATE TABLE test_results (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id        UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
    user_id           UUID NOT NULL,
    total_questions   INT NOT NULL,
    correct           INT NOT NULL DEFAULT 0,
    incorrect         INT NOT NULL DEFAULT 0,
    unattempted       INT NOT NULL DEFAULT 0,
    score             NUMERIC(5,2) NOT NULL,
    time_taken        INT NOT NULL,
    subject_breakdown JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE bookmarks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    question    JSONB NOT NULL,
    note        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, question_id)
);

-- Notes
CREATE TABLE notes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    title      VARCHAR(255) NOT NULL,
    content    TEXT NOT NULL,
    subject    VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_test_results_user   ON test_results(user_id);
CREATE INDEX idx_bookmarks_user      ON bookmarks(user_id);
CREATE INDEX idx_notes_user          ON notes(user_id);
CREATE INDEX idx_test_answers_session ON test_answers(session_id);
