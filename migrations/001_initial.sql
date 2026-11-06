CREATE SCHEMA IF NOT EXISTS sm5s;
CREATE TABLE IF NOT EXISTS sm5s.schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS sm5s.users (
 id text PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL,
 role text NOT NULL CHECK(role IN ('MASTER','ADMIN','AUDITOR')),
 password_hash text NOT NULL, must_change_password boolean NOT NULL DEFAULT true,
 temporary_expires_at timestamptz, active boolean NOT NULL DEFAULT true,
 auth_version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sm5s.sessions (
 token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES sm5s.users(id) ON DELETE CASCADE,
 auth_version integer NOT NULL, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sm5s.sessions(user_id);
CREATE TABLE IF NOT EXISTS sm5s.login_attempts (key text PRIMARY KEY, attempts integer NOT NULL, window_started timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS sm5s.units (id text PRIMARY KEY, name text NOT NULL, normalized_name text NOT NULL UNIQUE, active boolean NOT NULL DEFAULT true);
CREATE TABLE IF NOT EXISTS sm5s.sectors (
 id text PRIMARY KEY, unit_id text NOT NULL REFERENCES sm5s.units(id), name text NOT NULL,
 normalized_name text NOT NULL, active boolean NOT NULL DEFAULT true, UNIQUE(unit_id,normalized_name)
);
CREATE TABLE IF NOT EXISTS sm5s.audits (
 id text PRIMARY KEY, sector_id text NOT NULL REFERENCES sm5s.sectors(id), date date NOT NULL,
 auditor_id text REFERENCES sm5s.users(id), auditor_name text NOT NULL,
 status text NOT NULL CHECK(status IN ('PLANNED','IN_PROGRESS','REVIEW','FINALIZED')),
 source text NOT NULL CHECK(source IN ('LIVE','HISTORICAL')), notes text NOT NULL DEFAULT '',
 sense_notes jsonb NOT NULL DEFAULT '{}', questions jsonb NOT NULL DEFAULT '[]', overall double precision,
 revision integer NOT NULL DEFAULT 1, created_by text REFERENCES sm5s.users(id), reviewed_by text REFERENCES sm5s.users(id),
 finalized_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(sector_id,date), CHECK(overall IS NULL OR overall BETWEEN 0 AND 100)
);
CREATE INDEX IF NOT EXISTS audits_date_idx ON sm5s.audits(date,status);
CREATE INDEX IF NOT EXISTS audits_auditor_idx ON sm5s.audits(auditor_id);
CREATE TABLE IF NOT EXISTS sm5s.answers (
 audit_id text NOT NULL REFERENCES sm5s.audits(id), question_id text NOT NULL, sense smallint NOT NULL CHECK(sense BETWEEN 1 AND 5),
 score double precision CHECK(score IN (0,25,50,75,100)), note text NOT NULL DEFAULT '', PRIMARY KEY(audit_id,question_id)
);
CREATE TABLE IF NOT EXISTS sm5s.summaries (
 audit_id text NOT NULL REFERENCES sm5s.audits(id), sense smallint NOT NULL CHECK(sense BETWEEN 1 AND 5),
 score double precision NOT NULL CHECK(score BETWEEN 0 AND 100), PRIMARY KEY(audit_id,sense)
);
CREATE TABLE IF NOT EXISTS sm5s.evidence (
 id text PRIMARY KEY, audit_id text NOT NULL REFERENCES sm5s.audits(id), sense smallint NOT NULL CHECK(sense BETWEEN 1 AND 5),
 data bytea NOT NULL, mime_type text NOT NULL CHECK(mime_type='image/webp'),
 size integer NOT NULL CHECK(size BETWEEN 1 AND 460800), width integer NOT NULL CHECK(width BETWEEN 1 AND 1400),
 height integer NOT NULL CHECK(height BETWEEN 1 AND 1400), description text NOT NULL DEFAULT '',
 created_by text NOT NULL REFERENCES sm5s.users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sm5s.events (
 id text PRIMARY KEY, audit_id text REFERENCES sm5s.audits(id), actor_id text REFERENCES sm5s.users(id),
 action text NOT NULL, detail text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_audit_idx ON sm5s.events(audit_id,created_at);
CREATE TABLE IF NOT EXISTS sm5s.import_batches (
 id text PRIMARY KEY, actor_id text NOT NULL REFERENCES sm5s.users(id), file_hash text NOT NULL UNIQUE,
 report jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO sm5s.schema_migrations(version) VALUES ('001_initial') ON CONFLICT DO NOTHING;
