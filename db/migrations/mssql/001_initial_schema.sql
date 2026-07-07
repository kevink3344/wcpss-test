-- Migration: 001_initial_schema.sql (SQL Server)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='APP_CONFIG' AND xtype='U')
BEGIN
  CREATE TABLE APP_CONFIG (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    config_key   NVARCHAR(255) NOT NULL UNIQUE,
    config_value NVARCHAR(MAX) NULL,
    description  NVARCHAR(500) NULL,
    created_at   DATETIME2 DEFAULT GETDATE(),
    updated_at   DATETIME2 DEFAULT GETDATE()
  );
  INSERT INTO APP_CONFIG (config_key, config_value, description) VALUES
    ('APP_NAME',    'WCPSS Test',  'Display name of the application'),
    ('MAINTENANCE', 'false',       'Set to true to show maintenance banner');
END
