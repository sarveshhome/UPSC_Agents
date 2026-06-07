-- Phase 5: AI, Subscription, Offline, Admin Schema

-- AI Recommendations
CREATE TABLE ai_recommendations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL,
    weak_topics    JSONB DEFAULT '[]',
    learning_path  JSONB DEFAULT '[]',
    generated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- AI Predictions
CREATE TABLE ai_predictions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL,
    success_probability NUMERIC(5,2),
    rank_prediction     INT,
    confidence_score    NUMERIC(5,2),
    generated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Spaced Repetition / Revision Schedule
CREATE TABLE revision_schedule (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL,
    topic        VARCHAR(255) NOT NULL,
    subject      VARCHAR(100),
    next_review  DATE NOT NULL,
    interval     INT NOT NULL DEFAULT 1,  -- days
    ease_factor  NUMERIC(4,2) DEFAULT 2.5,
    repetitions  INT DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Plans
CREATE TABLE subscription_plans (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL,
    price       NUMERIC(10,2) NOT NULL,
    duration    INT NOT NULL,   -- days
    features    JSONB DEFAULT '[]',
    is_active   BOOLEAN DEFAULT TRUE
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    plan_id         UUID NOT NULL REFERENCES subscription_plans(id),
    razorpay_order  VARCHAR(255),
    razorpay_payment VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
    starts_at       TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Offline Question Bank (synced snapshots)
CREATE TABLE offline_questions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    payload     JSONB NOT NULL,   -- array of questions
    synced_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Offline Notes Sync Log
CREATE TABLE offline_sync_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    entity      VARCHAR(50) NOT NULL,  -- 'notes' | 'bookmarks'
    payload     JSONB NOT NULL,
    synced_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Admin: Question Management
CREATE TABLE managed_questions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject     VARCHAR(100) NOT NULL,
    topic       VARCHAR(255),
    difficulty  VARCHAR(20) DEFAULT 'medium',
    payload     JSONB NOT NULL,   -- {Ques, Option1..5, Ans}
    created_by  UUID,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default plans
INSERT INTO subscription_plans (name, price, duration, features) VALUES
  ('Free',    0,    36500, '["10 questions/day","Basic analytics"]'),
  ('Pro',     199,  30,    '["Unlimited questions","AI recommendations","Offline mode"]'),
  ('Premium', 499,  90,    '["Everything in Pro","Rank prediction","Priority support"]');

-- Indexes
CREATE INDEX idx_ai_rec_user      ON ai_recommendations(user_id);
CREATE INDEX idx_ai_pred_user     ON ai_predictions(user_id);
CREATE INDEX idx_revision_user    ON revision_schedule(user_id, next_review);
CREATE INDEX idx_user_subs_user   ON user_subscriptions(user_id);
CREATE INDEX idx_offline_q_user   ON offline_questions(user_id);
CREATE INDEX idx_managed_q_subj   ON managed_questions(subject);
