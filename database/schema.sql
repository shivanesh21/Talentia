-- ═══════════════════════════════════════════════════════════
-- TALENTIA ’26 — PostgreSQL schema
-- Run: psql $DATABASE_URL -f database/schema.sql
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS registrations (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  register_number TEXT NOT NULL,
  department      TEXT NOT NULL,
  year            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT NOT NULL,
  selected_event  TEXT NOT NULL CHECK (selected_event IN (
    'binary-quest','data-deductive','aptitude-arena',
    'flip-frenzy','meme-decode','gift-hunt'
  )),
  team_members    TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations (selected_event);
CREATE INDEX IF NOT EXISTS idx_reg_created ON registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reg_search ON registrations (name, register_number, email);

-- Future admin tables (foundation only)
CREATE TABLE IF NOT EXISTS event_details (
  event_id    TEXT PRIMARY KEY,
  date        TEXT NOT NULL DEFAULT '[EVENT DATE]',
  time        TEXT NOT NULL DEFAULT '[EVENT TIME]',
  venue       TEXT NOT NULL DEFAULT '[EVENT VENUE]',
  team_size   TEXT NOT NULL DEFAULT '[TEAM SIZE]',
  fee         TEXT NOT NULL DEFAULT '[FEE]',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_queries (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- V2 — users / teams / multi-event registrations (idempotent)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS students (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  register_number TEXT NOT NULL UNIQUE,
  department      TEXT NOT NULL,
  year            TEXT NOT NULL DEFAULT 'First Year',
  phone           TEXT NOT NULL,
  email           TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_students_regno ON students (register_number);

CREATE TABLE IF NOT EXISTS teams (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL DEFAULT '',
  leader_student_id TEXT NOT NULL REFERENCES students(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id              TEXT PRIMARY KEY,
  team_id         TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  register_number TEXT NOT NULL,
  department      TEXT NOT NULL DEFAULT '',
  phone           TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, register_number)
);

CREATE TABLE IF NOT EXISTS events (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  slot        TEXT NOT NULL DEFAULT '',
  time        TEXT NOT NULL DEFAULT ''
);

-- V2.1: time/slot columns (safe on existing DBs)
ALTER TABLE events ADD COLUMN IF NOT EXISTS slot TEXT NOT NULL DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS time TEXT NOT NULL DEFAULT '';

INSERT INTO events (id, name, category, description, slot, time) VALUES
  ('binary-quest',   'BINARY QUEST',   'Technical',     'Decode binary and other coded formats into meaningful text through logic and accuracy.', 'Morning',   '9:00 AM – 12:30 PM'),
  ('data-deductive', 'DATA DEDUCTIVE', 'Technical',     'Analyse Excel-based data, identify hidden patterns, and solve questions using logical deduction.', 'Morning', '9:00 AM – 12:30 PM'),
  ('aptitude-arena', 'APTITUDE ARENA', 'Technical',     'Test your aptitude, logical reasoning, and puzzle-solving skills against the clock.', 'Afternoon', '1:30 – 4:30 PM'),
  ('flip-frenzy',    'FLIP FRENZY',    'Non-Technical', 'Flip, balance, and land the bottle successfully through precision, timing, and control.', 'Morning', '9:00 AM – 12:30 PM'),
  ('meme-decode',    'MEME DECODE',    'Non-Technical', 'Analyse trending Tamil memes, understand their context, and translate their meaning into English.', 'Afternoon', '1:30 – 4:30 PM'),
  ('gift-hunt',      'THE GIFT HUNT',  'Non-Technical', 'Follow clues, analyse hints, and predict which boxes contain gifts, prizes, or surprises.', 'Afternoon', '1:30 – 4:30 PM')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, description = EXCLUDED.description, slot = EXCLUDED.slot, time = EXCLUDED.time;

CREATE TABLE IF NOT EXISTS event_registrations (
  id                 TEXT PRIMARY KEY,
  event_id           TEXT NOT NULL REFERENCES events(id),
  student_id         TEXT NOT NULL REFERENCES students(id),
  team_id            TEXT REFERENCES teams(id) ON DELETE CASCADE,
  participation_type TEXT NOT NULL CHECK (participation_type IN ('individual', 'team')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Duplicate prevention at DB level:
-- same student × same event (individual) only once
CREATE UNIQUE INDEX IF NOT EXISTS uq_reg_individual
  ON event_registrations (event_id, student_id) WHERE team_id IS NULL;
-- same team × same event only once
CREATE UNIQUE INDEX IF NOT EXISTS uq_reg_team
  ON event_registrations (event_id, team_id) WHERE team_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ereg_event ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_ereg_student ON event_registrations (student_id);
CREATE INDEX IF NOT EXISTS idx_ereg_created ON event_registrations (created_at DESC);
