-- Migration: 002_create_app_settings.sql (SQLite / Turso)

CREATE TABLE IF NOT EXISTS APP_SETTINGS (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key   TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  label         TEXT NOT NULL,
  description   TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO APP_SETTINGS (setting_key, setting_value, label, description) VALUES
  ('APP_TITLE', 'WCPSS Test App', 'App Title', 'The title displayed in the application header');
