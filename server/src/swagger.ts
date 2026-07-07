import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WCPSS Test API',
      version: '1.0.0',
      description: 'REST API for the WCPSS Test application',
    },
    servers: [
      { url: '/api', description: 'Current environment' },
    ],
    tags: [
      { name: 'System', description: 'Health and connectivity' },
      { name: 'Config', description: 'Application configuration (APP_CONFIG table)' },
      { name: 'Settings', description: 'Application settings (APP_SETTINGS table)' },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'Service is running',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } },
                },
              },
            },
          },
        },
      },
      '/status': {
        get: {
          tags: ['System'],
          summary: 'Database connection status',
          responses: {
            200: {
              description: 'Connection result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      connected: { type: 'boolean' },
                      message: { type: 'string', example: 'Connected to Azure SQL Server (wcpss-data-collection)' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/config': {
        get: {
          tags: ['Config'],
          summary: 'Get all APP_CONFIG entries as a key/value map',
          responses: {
            200: {
              description: 'Config map',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    additionalProperties: { type: 'string' },
                    example: { APP_NAME: 'WCPSS Test', MAINTENANCE: 'false' },
                  },
                },
              },
            },
          },
        },
      },
      '/settings': {
        get: {
          tags: ['Settings'],
          summary: 'Get all APP_SETTINGS rows',
          responses: {
            200: {
              description: 'List of settings',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Setting' },
                  },
                },
              },
            },
          },
        },
      },
      '/settings/{key}': {
        put: {
          tags: ['Settings'],
          summary: 'Update a setting value by key',
          parameters: [
            {
              name: 'key',
              in: 'path',
              required: true,
              schema: { type: 'string', example: 'APP_TITLE' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['value'],
                  properties: { value: { type: 'string', example: 'My App' } },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Updated successfully',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
                },
              },
            },
            400: { description: 'Missing value field' },
          },
        },
      },
    },
    components: {
      schemas: {
        Setting: {
          type: 'object',
          properties: {
            setting_key:   { type: 'string', example: 'APP_TITLE' },
            setting_value: { type: 'string', example: 'WCPSS Test App' },
            label:         { type: 'string', example: 'App Title' },
            description:   { type: 'string', example: 'The title displayed in the application header' },
          },
        },
      },
    },
  },
  apis: [],
}

export const swaggerSpec = swaggerJsdoc(options)
