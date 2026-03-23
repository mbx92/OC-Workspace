export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  })

  const host = getRequestHeader(event, 'host') || 'localhost:3000'
  const proto =
    getRequestHeader(event, 'x-forwarded-proto') ||
    (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  const serverUrl = `${proto}://${host}`

  return {
    openapi: '3.0.3',
    info: {
      title: 'OCS Workspace — Integration API',
      version: '1.0.0',
      description: [
        'REST API for connecting external systems (CMS, issue trackers, project tools, internal apps) to OCS Workspace.',
        '',
        '## Authentication',
        'Two authentication methods are supported:',
        '',
        '**Session cookie** (for admin operations — connection management, mappings, etc.):',
        'Login via `POST /api/auth/login` and include the `session_token`',
        'cookie in all subsequent requests (e.g. `-b cookies.txt` in curl, or `credentials: "include"` in fetch).',
        '',
        '**Bearer API key** (for external system integrations — push, sync, read records):',
        'Use `Authorization: Bearer <apiKey>` header. The API key is generated when a connection is created',
        'and can be rotated via `POST /api/integrations/{id}/rotate-key`.',
        '',
        '## Roles',
        '| Role | Level | Access |',
        '|------|-------|--------|',
        '| owner | 100 | All operations |',
        '| admin | 90 | All including writes |',
        '| project_manager | 70 | Read (GET) only |',
        '| developer / qa | 40 | No integration access |',
        '',
        '## Key Workflow',
        '1. **Login** → `POST /api/auth/login` (save `session_token` cookie)',
        '2. **Register connection** → `POST /api/integrations` (save returned `id` as `CONNECTION_UUID` and `apiKey`)',
        '3. **Define mappings** (optional) → `POST /api/integrations/{id}/mappings`',
        '4. **Push records** (real-time) → `POST /api/integrations/{id}/push` on every data change (Bearer API key)',
        '5. **Queue batch sync** (scheduled) → `POST /api/integrations/{id}/sync` (Bearer API key)',
        '6. **Read back records** → `GET /api/integrations/{id}/records` (Bearer API key)',
        '',
        '> **Note:** Steps 4–6 use the Bearer API key and do not require an admin session.',
      ].join('\n'),
    },
    servers: [{ url: serverUrl, description: 'Current server' }],
    tags: [
      { name: 'Auth', description: 'Authentication' },
      { name: 'Connections', description: 'Manage integration connections (requires session cookie)' },
      { name: 'Records', description: 'Push records, sync jobs, and read back pushed records (supports Bearer API key)' },
    ],
    security: [{ sessionCookie: [] }],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          operationId: 'login',
          summary: 'Login and get session cookie',
          description: 'Authenticate with email and password. Sets a `session_token` cookie used by all other endpoints.',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
                example: { email: 'admin@example.com', password: 'yourpassword' },
              },
            },
          },
          responses: {
            200: { description: 'Login successful. session_token cookie is set.' },
            401: { description: 'Invalid credentials.' },
          },
        },
      },
      '/api/integrations': {
        get: {
          tags: ['Connections'],
          operationId: 'listConnections',
          summary: 'List all connections',
          security: [{ sessionCookie: [] }],
          description: 'List all integration connections. Optionally filter by project. Requires session cookie (project_manager or higher).',
          parameters: [
            {
              name: 'projectId',
              in: 'query',
              description: 'Filter by project UUID',
              required: false,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Array of connections',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Connection' } },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
        post: {
          tags: ['Connections'],
          operationId: 'createConnection',
          summary: 'Register a new connection',
          security: [{ sessionCookie: [] }],
          description:
            'Register a new integration connection. Do this once during setup and save the returned `id` as your `CONNECTION_UUID` and `apiKey` for all subsequent calls. Requires admin session.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateConnectionRequest' },
                example: {
                  name: 'My CMS',
                  providerType: 'rest_api',
                  baseUrl: 'https://cms.mycompany.com',
                  authType: 'bearer_token',
                  projectId: 'PROJECT_UUID',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Connection created. Contains `apiKey` — plain-text key shown only once.',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Connection' },
                      {
                        type: 'object',
                        properties: {
                          apiKey: {
                            type: 'string',
                            description: 'Plain-text API key — shown only once. Use as "Authorization: Bearer <key>" for /push and /sync.',
                            example: 'ocs_a1b2c3d4e5f6...',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/api/integrations/{id}': {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Connection UUID',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        get: {
          tags: ['Connections'],
          operationId: 'getConnection',
          summary: 'Get connection detail',
          security: [{ sessionCookie: [] }],
          description:
            'Get full connection detail: configuration, field mappings, sync job history, and all external records. Requires session cookie (project_manager or higher). To fetch only the records list using a Bearer API key, use `GET /api/integrations/{id}/records`.',
          responses: {
            200: {
              description: 'Connection detail with related data',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ConnectionDetail' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
        patch: {
          tags: ['Connections'],
          operationId: 'updateConnection',
          summary: 'Update connection (partial)',
          security: [{ sessionCookie: [] }],
          description: 'Partially update a connection. All fields are optional — only send fields you want to change. Requires admin session.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateConnectionRequest' },
                example: { name: 'CMS v2', authType: 'api_key' },
              },
            },
          },
          responses: {
            200: {
              description: 'Updated connection',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Connection' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/api/integrations/{id}/mappings': {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Connection UUID',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        post: {
          tags: ['Records'],
          operationId: 'addFieldMapping',
          summary: 'Add field mapping rule',
          security: [{ sessionCookie: [] }],
          description:
            'Define how a field from the source system maps to a field in this workspace. Example: `cms_title` → `title`. Requires admin session.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateMappingRequest' },
                example: { sourceField: 'issue.title', targetField: 'title' },
              },
            },
          },
          responses: {
            200: {
              description: 'Mapping created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/FieldMapping' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/api/integrations/{id}/push': {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Connection UUID',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        post: {
          tags: ['Records'],
          operationId: 'pushRecord',
          summary: '★ Push external record (main endpoint)',
          security: [{ bearerApiKey: [] }, { sessionCookie: [] }],
          description: [
            'Push a single entity from an external system into this workspace.',
            '',
            '**For `task`, `feature`, and `bug` types**: the entity is created or updated directly in the real project module tables.',
            'For any other `sourceEntityType` value, the record is stored in the staging `external_records` table only.',
            '',
            '**Idempotent**: deduplicated by `sourceId` + `connectionId` + `sourceEntityType` — safe to call on every data change.',
            '',
            'Response returns `action: "created"` or `action: "updated"`, plus `mappedEntityId` pointing to the created/updated workspace entity (for task/feature/bug).',
            '',
            '**Status auto-mapping**: values like `wip`, `fixed`, `blocker`, `urgent` are automatically mapped to the closest OCS enum value.',
          ].join('\n'),
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PushRecordRequest' },
                example: {
                  sourceId: 'BUG-101',
                  sourceEntityType: 'bug',
                  projectId: 'PROJECT_UUID',
                  sourcePayload: {
                    title: 'Login crash on Safari',
                    description: 'Crash on iOS Safari 17 when clicking login',
                    severity: 'high',
                    priority: 'critical',
                    status: 'open',
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Record pushed',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/PushRecordResponse' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            422: { $ref: '#/components/responses/ValidationError' },
          },
        },
      },
      '/api/integrations/{id}/sync': {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Connection UUID',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        post: {
          tags: ['Records'],
          operationId: 'queueSyncJob',
          summary: 'Queue a sync job',
          security: [{ bearerApiKey: [] }, { sessionCookie: [] }],
          description:
            'Queue a sync job for this connection. Saved with status `queued` for processing by an external worker or cron. Use `/push` for real-time; use `/sync` for scheduled batch runs.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateSyncJobRequest' },
                example: { jobType: 'full_sync' },
              },
            },
          },
          responses: {
            200: {
              description: 'Sync job queued',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/SyncJob' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/api/integrations/{id}/records': {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Connection UUID',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        get: {
          tags: ['Records'],
          operationId: 'listRecords',
          summary: 'List external records for a connection',
          security: [{ bearerApiKey: [] }, { sessionCookie: [] }],
          description: [
            'Fetch all external records pushed to this connection.',
            '',
            'Supports filtering by `type` query param (e.g. `?type=task`).',
            '',
            'Accepts **Bearer API key** (no admin session required) or session cookie (project_manager+).',
            '',
            'This is the recommended endpoint for external systems to read back their own pushed records.',
          ].join('\n'),
          parameters: [
            {
              name: 'type',
              in: 'query',
              required: false,
              description: 'Filter by sourceEntityType (e.g. task, feature, bug, order)',
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Array of external records',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      records: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ExternalRecord' },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },
      '/api/integrations/{id}/rotate-key': {
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Connection UUID',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        post: {
          tags: ['Connections'],
          operationId: 'rotateApiKey',
          summary: 'Rotate API key',
          security: [{ sessionCookie: [] }],
          description: 'Generate a new API key for this connection. The old key is immediately invalidated. Returns the new plain-text key — this is the only time it is visible. Requires admin session (session cookie only).',
          responses: {
            200: {
              description: 'New API key generated',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Connection' },
                      {
                        type: 'object',
                        properties: {
                          apiKey: {
                            type: 'string',
                            description: 'Plain-text API key — shown only once. Store it securely.',
                            example: 'ocs_a1b2c3d4...',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session_token',
          description: 'Session cookie obtained from POST /api/auth/login. Used for connection management endpoints (admin+).',
        },
        bearerApiKey: {
          type: 'http',
          scheme: 'bearer',
          description: 'Per-connection API key generated when a connection is created (or rotated via POST /api/integrations/{id}/rotate-key). Use this for /push and /sync from external systems — no admin account required.',
        },
      },
      responses: {
        Unauthorized: {
          description: 'No active session or invalid session_token cookie',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Forbidden: {
          description: 'Role insufficient for this operation (minimum: admin for writes, project_manager for reads)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'Connection ID not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        ValidationError: {
          description: 'Validation failed — required field missing or wrong format',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            statusCode: { type: 'number' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@example.com' },
            password: { type: 'string', example: 'yourpassword' },
          },
        },
        Connection: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Connection UUID — use this as CONNECTION_UUID in all subsequent calls',
            },
            name: { type: 'string', example: 'My CMS' },
            providerType: {
              type: 'string',
              enum: ['rest_api', 'graphql', 'webhook', 'database', 'file_import', 'custom'],
            },
            status: {
              type: 'string',
              enum: ['active', 'paused', 'error', 'archived'],
              default: 'active',
            },
            authType: {
              type: 'string',
              enum: ['none', 'api_key', 'bearer_token', 'basic_auth', 'oauth2'],
            },
            baseUrl: { type: 'string', format: 'uri', nullable: true },
            projectId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ConnectionDetail: {
          type: 'object',
          properties: {
            connection: { $ref: '#/components/schemas/Connection' },
            mappings: { type: 'array', items: { $ref: '#/components/schemas/FieldMapping' } },
            syncJobs: { type: 'array', items: { $ref: '#/components/schemas/SyncJob' } },
            records: { type: 'array', items: { $ref: '#/components/schemas/ExternalRecord' } },
          },
        },
        CreateConnectionRequest: {
          type: 'object',
          required: ['name', 'providerType'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            providerType: {
              type: 'string',
              enum: ['rest_api', 'graphql', 'webhook', 'database', 'file_import', 'custom'],
            },
            projectId: { type: 'string', format: 'uuid', nullable: true },
            baseUrl: { type: 'string', format: 'uri', nullable: true },
            authType: {
              type: 'string',
              enum: ['none', 'api_key', 'bearer_token', 'basic_auth', 'oauth2'],
              default: 'none',
            },
          },
        },
        UpdateConnectionRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            providerType: {
              type: 'string',
              enum: ['rest_api', 'graphql', 'webhook', 'database', 'file_import', 'custom'],
            },
            status: { type: 'string', enum: ['active', 'paused', 'error', 'archived'] },
            authType: {
              type: 'string',
              enum: ['none', 'api_key', 'bearer_token', 'basic_auth', 'oauth2'],
            },
            baseUrl: { type: 'string', format: 'uri', nullable: true },
          },
        },
        CreateMappingRequest: {
          type: 'object',
          required: ['sourceField', 'targetField'],
          properties: {
            sourceField: {
              type: 'string',
              description: 'Field name in the external system',
              example: 'issue.title',
            },
            targetField: {
              type: 'string',
              description: 'Target field in workspace',
              example: 'title',
            },
            transformRule: { type: 'string', nullable: true, description: 'Optional transformation rule' },
          },
        },
        FieldMapping: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            connectionId: { type: 'string', format: 'uuid' },
            sourceField: { type: 'string' },
            targetField: { type: 'string' },
            transformRule: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PushRecordRequest: {
          type: 'object',
          required: ['sourceId', 'sourceEntityType'],
          properties: {
            sourceId: {
              type: 'string',
              description: 'Unique ID in the source system (e.g. TASK-42, BUG-7). Used for idempotent upsert.',
              example: 'BUG-101',
            },
            sourceEntityType: {
              type: 'string',
              description:
                'Entity type. Use `task`, `feature`, or `bug` to sync into real project module tables. Any other string value (e.g. `order`, `invoice`, `ping`) stores to the staging `external_records` table only — useful for logging or custom integrations.',
              example: 'bug',
            },
            sourcePayload: {
              type: 'object',
              description:
                'Entity fields. Required for task/feature/bug. Fields are mapped automatically to the OCS schema (see field map per type in docs).',
              properties: {
                title: { type: 'string', description: 'Required for all synced entity types' },
                description: { type: 'string', nullable: true },
                status: {
                  type: 'string',
                  description:
                    'Status value — auto-mapped to OCS enum. Accepted aliases: wip→in-progress, fixed→resolved, blocker→critical, etc.',
                },
                priority: { type: 'string', description: 'Priority value — auto-mapped (urgent→critical, major→high, normal→medium, etc.)' },
                severity: { type: 'string', description: '[bug only] Severity level' },
                dueDate: { type: 'string', format: 'date', description: '[task/bug] Due date' },
                featureId: { type: 'string', format: 'uuid', description: '[task only] Link to an existing OCS feature UUID' },
                targetRelease: { type: 'string', description: '[feature only] Release version string' },
                businessValue: { type: 'string', description: '[feature only] Business value description' },
              },
              example: { title: 'Login crash on Safari', severity: 'high', priority: 'critical', status: 'open' },
            },
            projectId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Target project UUID. Required for task/feature/bug if not set on the connection.',
            },
            sourceStatus: {
              type: 'string',
              nullable: true,
              description: 'Top-level status shortcut — used if sourcePayload.status is absent',
            },
          },
        },
        PushRecordResponse: {
          type: 'object',
          properties: {
            record: { $ref: '#/components/schemas/ExternalRecord' },
            action: {
              type: 'string',
              enum: ['created', 'updated'],
              description: '"created" if the sourceId was new, "updated" if it already existed',
            },
            mappedEntityType: {
              type: 'string',
              nullable: true,
              description: 'The OCS entity type that was created/updated (task, feature, or bug)',
            },
            mappedEntityId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'UUID of the created/updated OCS entity — use this to reference the entity in other API calls',
            },
          },
        },
        ExternalRecord: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            connectionId: { type: 'string', format: 'uuid' },
            sourceId: { type: 'string', description: 'Unique ID from the source system' },
            sourceEntityType: { type: 'string', description: 'Entity type as sent by the source system' },
            sourceStatus: { type: 'string', nullable: true, description: 'Raw status value from the source' },
            sourcePayloadJson: {
              type: 'object',
              nullable: true,
              description: 'The full payload object sent by the source system via /push',
            },
            mappedEntityType: { type: 'string', nullable: true, description: 'OCS entity type that was created/updated (task, feature, or bug)' },
            mappedEntityId: { type: 'string', format: 'uuid', nullable: true, description: 'UUID of the OCS entity linked to this record' },
            projectId: { type: 'string', format: 'uuid', nullable: true },
            lastSeenAt: { type: 'string', format: 'date-time', description: 'Last time this record was pushed/updated' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateSyncJobRequest: {
          type: 'object',
          required: ['jobType'],
          properties: {
            jobType: {
              type: 'string',
              enum: ['full_sync', 'incremental_sync', 'webhook_replay'],
              example: 'full_sync',
            },
          },
        },
        SyncJob: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            connectionId: { type: 'string', format: 'uuid' },
            jobType: {
              type: 'string',
              enum: ['full_sync', 'incremental_sync', 'webhook_replay'],
            },
            status: {
              type: 'string',
              enum: ['queued', 'running', 'succeeded', 'partial', 'failed'],
            },
            recordsProcessed: { type: 'number', nullable: true },
            errorMessage: { type: 'string', nullable: true },
            startedAt: { type: 'string', format: 'date-time', nullable: true },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }
})
