-- Migration: 002_create_app_settings.sql (SQL Server)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='APP_SETTINGS' AND xtype='U')
BEGIN
  CREATE TABLE APP_SETTINGS (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    setting_key   NVARCHAR(255) NOT NULL UNIQUE,
    setting_value NVARCHAR(MAX) NULL,
    label         NVARCHAR(255) NOT NULL,
    description   NVARCHAR(500) NULL,
    created_at    DATETIME2 DEFAULT GETDATE(),
    updated_at    DATETIME2 DEFAULT GETDATE()
  );
  INSERT INTO APP_SETTINGS (setting_key, setting_value, label, description) VALUES
    ('APP_TITLE', 'WCPSS Test App', 'App Title', 'The title displayed in the application header');
END
