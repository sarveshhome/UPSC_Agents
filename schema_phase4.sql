-- Phase 4: Gamification & Community PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── XP & Levels ───────────────────────────────────────────────

CREATE TABLE user_xp (
    user_id      UUID PRIMARY KEY,
    total_xp     INT NOT NULL DEFAULT 0,
    level        INT NOT NULL DEFAULT 1,
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE xp_events (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,  -- 'answer_correct','test_complete','streak_bonus','badge_earned'
    xp_awarded INT NOT NULL,
    metadata   JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Badges ────────────────────────────────────────────────────

CREATE TABLE badge_definitions (
    id          VARCHAR(50) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon        VARCHAR(10)  NOT NULL,  -- emoji
    xp_reward   INT NOT NULL DEFAULT 0,
    criteria    JSONB NOT NULL          -- {type, threshold}
);

CREATE TABLE user_badges (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    badge_id   VARCHAR(50) NOT NULL REFERENCES badge_definitions(id),
    earned_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

-- ── Streaks ───────────────────────────────────────────────────

CREATE TABLE user_streaks (
    user_id        UUID PRIMARY KEY,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_activity  DATE,
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Leaderboard ───────────────────────────────────────────────

CREATE TABLE leaderboard_weekly (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    username   VARCHAR(100) NOT NULL,
    state      VARCHAR(100),
    xp_this_week INT NOT NULL DEFAULT 0,
    week_start DATE NOT NULL,
    UNIQUE (user_id, week_start)
);

-- ── Community ─────────────────────────────────────────────────

CREATE TABLE community_posts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL,
    username   VARCHAR(100) NOT NULL,
    post_type  VARCHAR(30) NOT NULL CHECK (post_type IN ('achievement','milestone','invite','general')),
    content    TEXT NOT NULL,
    metadata   JSONB DEFAULT '{}',
    likes      INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_likes (
    post_id    UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- ── Seed Badge Definitions ────────────────────────────────────

INSERT INTO badge_definitions VALUES
  ('first_answer',    'First Step',        'Answer your first question',      '🎯', 10,  '{"type":"correct_answers","threshold":1}'),
  ('streak_3',        '3-Day Streak',      'Study 3 days in a row',           '🔥', 30,  '{"type":"streak","threshold":3}'),
  ('streak_7',        'Weekly Warrior',    'Study 7 days in a row',           '⚡', 100, '{"type":"streak","threshold":7}'),
  ('streak_30',       'Iron Will',         'Study 30 days in a row',          '💎', 500, '{"type":"streak","threshold":30}'),
  ('correct_10',      'Sharp Mind',        'Answer 10 questions correctly',   '🧠', 50,  '{"type":"correct_answers","threshold":10}'),
  ('correct_100',     'Century',           'Answer 100 questions correctly',  '💯', 200, '{"type":"correct_answers","threshold":100}'),
  ('test_complete_1', 'Test Taker',        'Complete your first test',        '📝', 50,  '{"type":"tests_completed","threshold":1}'),
  ('test_complete_10','Test Master',       'Complete 10 tests',               '🏆', 300, '{"type":"tests_completed","threshold":10}'),
  ('level_5',         'Rising Star',       'Reach Level 5',                   '⭐', 0,   '{"type":"level","threshold":5}'),
  ('level_10',        'Expert',            'Reach Level 10',                  '🌟', 0,   '{"type":"level","threshold":10}');

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX idx_xp_events_user        ON xp_events(user_id);
CREATE INDEX idx_user_badges_user       ON user_badges(user_id);
CREATE INDEX idx_leaderboard_week       ON leaderboard_weekly(week_start, xp_this_week DESC);
CREATE INDEX idx_community_posts_time   ON community_posts(created_at DESC);
