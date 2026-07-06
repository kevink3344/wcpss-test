-- Migration: 002_create_app_config.sql

CREATE TABLE APP_CONFIG (
  id          INT IDENTITY(1,1) PRIMARY KEY,
  config_key  NVARCHAR(255) NOT NULL UNIQUE,
  config_value NVARCHAR(MAX) NULL,
  description NVARCHAR(500) NULL,
  created_at  DATETIME2 DEFAULT GETDATE(),
  updated_at  DATETIME2 DEFAULT GETDATE()
);

-- Seed initial config values
INSERT INTO APP_CONFIG (config_key, config_value, description) VALUES
  ('APP_NAME',    'WCPSS Test',  'Display name of the application'),
  ('MAINTENANCE', 'false',       'Set to true to show maintenance banner');
