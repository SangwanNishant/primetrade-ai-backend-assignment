const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '⚡ Primetrade.ai Task API',
      version: '1.0.0',
      description:
        'Scalable REST API with JWT Authentication, Role-Based Access Control, and full Task CRUD. Built for the Primetrade.ai Backend Developer Internship.',
      contact: {
        name: 'API Support',
        email: 'dev@primetrade.ai',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter your JWT token. Get one from POST /api/v1/auth/login',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3...' },
            name: { type: 'string', example: 'John Doe' },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T09:30:00.000Z',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Complete API documentation' },
            description: {
              type: 'string',
              example: 'Write Swagger docs for all endpoints',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in_progress', 'done'],
              example: 'in_progress',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'high',
            },
            due_date: {
              type: 'string',
              format: 'date',
              nullable: true,
              example: '2024-02-01',
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                token: { type: 'string', example: 'eyJhbGci...' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication — register, login, profile' },
      {
        name: 'Tasks',
        description: 'Task management — CRUD operations for tasks',
      },
      {
        name: 'Users (Admin)',
        description: 'User management — admin-only endpoints',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../modules/**/*.routes.js'),
    path.join(__dirname, '../modules/**/*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  // Serve Swagger UI
  app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: `
        .swagger-ui .topbar { background: #0a0a14; border-bottom: 1px solid #1e1e35; }
        .swagger-ui .topbar .download-url-wrapper { display: none; }
        .swagger-ui .info .title { color: #818cf8; }
        body { background: #0a0a14; }
      `,
      customSiteTitle: '⚡ Primetrade API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
      },
    })
  );

  // Serve raw OpenAPI JSON for Postman import
  app.get('/api/v1/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });
}

module.exports = { setupSwagger };
