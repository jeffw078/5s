ALTER TABLE sm5s.answers ALTER COLUMN score DROP NOT NULL;
INSERT INTO sm5s.schema_migrations(version) VALUES ('002_partial_notes') ON CONFLICT DO NOTHING;
