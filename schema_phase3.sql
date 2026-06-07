-- Phase 3: Analytics, Notifications, Current Affairs Schema

-- Analytics: per-user weekly snapshots
CREATE TABLE analytics_weekly (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    week        VARCHAR(10) NOT NULL,   -- e.g. 2025-W30
    total       INT NOT NULL DEFAULT 0,
    correct     INT NOT NULL DEFAULT 0,
    avg_score   NUMERIC(5,2) DEFAULT 0,
    subject_stats JSONB DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, week)
);

-- Analytics: per-user monthly snapshots
CREATE TABLE analytics_monthly (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    month       VARCHAR(7) NOT NULL,   -- e.g. 2025-07
    total       INT NOT NULL DEFAULT 0,
    correct     INT NOT NULL DEFAULT 0,
    avg_score   NUMERIC(5,2) DEFAULT 0,
    subject_stats JSONB DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, month)
);

-- Notification Preferences
CREATE TABLE notification_prefs (
    user_id              UUID PRIMARY KEY,
    study_reminder       BOOLEAN DEFAULT TRUE,
    study_reminder_time  TIME DEFAULT '08:00',
    test_reminder        BOOLEAN DEFAULT TRUE,
    test_reminder_time   TIME DEFAULT '18:00',
    current_affairs      BOOLEAN DEFAULT TRUE,
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Current Affairs Articles (cached)
CREATE TABLE current_affairs_articles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    summary     TEXT NOT NULL,
    source      VARCHAR(255),
    subject     VARCHAR(100),
    date        DATE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_weekly_user  ON analytics_weekly(user_id);
CREATE INDEX idx_analytics_monthly_user ON analytics_monthly(user_id);
CREATE INDEX idx_ca_articles_date       ON current_affairs_articles(date);
