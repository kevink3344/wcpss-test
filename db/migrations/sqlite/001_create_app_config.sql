-- Migration: 001_create_app_config.sql (SQLite / Turso)

CREATE TABLE IF NOT EXISTS APP_CONFIG (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key  TEXT NOT NULL UNIQUE,
  config_value TEXT,
  description TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO APP_CONFIG (config_key, config_value, description) VALUES
  ('APP_NAME',    'WCPSS Test', 'Display name of the application'),
  ('MAINTENANCE', 'false',      'Set to true to show maintenance banner');
