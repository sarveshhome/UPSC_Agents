-- Questions Schema (production PostgreSQL)
-- For local dev the SQLite equivalent is created automatically via question_gateway.py

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Questions pool (shared across all users)
CREATE TABLE questions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject      VARCHAR(100) NOT NULL,
    topic        VARCHAR(255),
    difficulty   VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
    question_text TEXT NOT NULL,
    explanation  TEXT,
    source       VARCHAR(20) DEFAULT 'cohere' CHECK (source IN ('cohere','manual')),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Question options (5 per question)
CREATE TABLE question_options (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id  UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_key   VARCHAR(10) NOT NULL,   -- Option1..Option5
    option_text  TEXT NOT NULL,
    is_correct   BOOLEAN NOT NULL DEFAULT FALSE
);

-- User question attempt history
CREATE TABLE user_question_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         INTEGER NOT NULL,
    question_id     UUID NOT NULL REFERENCES questions(id),
    selected_option VARCHAR(10),
    is_correct      BOOLEAN,
    time_taken      INT DEFAULT 0,
    is_bookmarked   BOOLEAN DEFAULT FALSE,
    attempted_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, question_id)
);

-- AI generation audit log
CREATE TABLE ai_generation_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt       TEXT NOT NULL,
    subject      VARCHAR(100),
    topic        VARCHAR(255),
    difficulty   VARCHAR(20),
    questions_generated INT DEFAULT 0,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_questions_subject_topic_diff ON questions(subject, topic, difficulty);
CREATE INDEX idx_uqh_user               ON user_question_history(user_id);
CREATE INDEX idx_uqh_user_question      ON user_question_history(user_id, question_id);
CREATE INDEX idx_options_question       ON question_options(question_id);
