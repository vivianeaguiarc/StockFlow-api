import {
  createUserRequestExample,
  forbiddenErrorExample,
  healthResponseExample,
  loginRequestExample,
  loginResponseExample,
  paginatedUsersResponseExample,
  readyResponseExample,
  refreshTokenRequestExample,
  refreshTokenResponseExample,
  unauthorizedErrorExample,
  userResponseExample,
  validationErrorExample,
} from './swagger-examples.js'

export const swaggerComponents = {
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'JWT access token obtained from `POST /api/v1/auth/login` or `POST /api/v1/auth/refresh`. Send as `Authorization: Bearer <token>`.',
    },
  },
  schemas: {
    ErrorResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Validation error' },
        error: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              example: 'VALIDATION_ERROR',
              enum: [
                'VALIDATION_ERROR',
                'UNAUTHORIZED',
                'FORBIDDEN',
                'NOT_FOUND',
                'CONFLICT',
                'TOO_MANY_REQUESTS',
                'PAYLOAD_TOO_LARGE',
                'INTERNAL_SERVER_ERROR',
                'SERVICE_UNAVAILABLE',
              ],
            },
            details: {
              type: 'array',
              items: { type: 'object' },
              example: [],
            },
          },
          required: ['code', 'details'],
        },
        requestId: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
          description: 'Request tracing identifier (also returned in X-Request-ID header)',
        },
      },
      required: ['success', 'message', 'error'],
      description:
        'Standard error envelope. Never includes passwords, token hashes, stack traces, or internal secrets.',
    },
    SuccessResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Operation completed successfully' },
        data: { type: 'object' },
      },
      required: ['success', 'message', 'data'],
    },
    PaginatedResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Resources retrieved successfully' },
        data: { type: 'array', items: { type: 'object' } },
        pagination: { $ref: '#/components/schemas/PaginationMeta' },
      },
      required: ['success', 'message', 'data', 'pagination'],
    },
    RootResponse: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'StockFlow API' },
        status: { type: 'string', example: 'running' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'production' },
        links: {
          type: 'object',
          properties: {
            docs: { type: 'string', example: '/api/docs' },
            health: { type: 'string', example: '/api/v1/health' },
            ready: { type: 'string', example: '/api/v1/ready' },
          },
          required: ['docs', 'health', 'ready'],
        },
      },
      required: ['name', 'status', 'version', 'environment', 'links'],
    },
    PaginationMeta: {
      type: 'object',
      properties: {
        page: { type: 'integer', example: 1 },
        limit: { type: 'integer', example: 10 },
        totalItems: { type: 'integer', example: 100 },
        totalPages: { type: 'integer', example: 10 },
        hasNextPage: { type: 'boolean', example: true },
        hasPreviousPage: { type: 'boolean', example: false },
      },
      required: ['page', 'limit', 'totalItems', 'totalPages', 'hasNextPage', 'hasPreviousPage'],
    },
    HealthResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'integer', example: 123 },
        environment: { type: 'string', example: 'development' },
        service: { type: 'string', example: 'StockFlow API' },
      },
      required: ['status', 'timestamp', 'uptime', 'environment'],
      example: healthResponseExample,
    },
    HealthLiveResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
      },
      required: ['status', 'timestamp'],
    },
    HealthReadyResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ready', 'not_ready'], example: 'ready' },
        services: {
          type: 'object',
          properties: {
            database: { type: 'string', enum: ['up', 'down'], example: 'up' },
            redis: { type: 'string', enum: ['up', 'down'], example: 'up' },
          },
          required: ['database', 'redis'],
        },
      },
      required: ['status', 'services'],
      example: readyResponseExample,
    },
    ReadyResponse: {
      description: 'Readiness probe payload (alias for HealthReadyResponse)',
      allOf: [{ $ref: '#/components/schemas/HealthReadyResponse' }],
      example: readyResponseExample,
    },
    HealthDetailsResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'], example: 'healthy' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
        uptime: { type: 'integer', example: 120 },
        services: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['up', 'down'], example: 'up' },
              },
              required: ['status'],
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['up', 'down'], example: 'up' },
              },
              required: ['status'],
            },
          },
          required: ['database', 'redis'],
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
      required: ['status', 'version', 'environment', 'uptime', 'services', 'timestamp'],
    },
    LoginRequest: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'admin@stockflow.com' },
        password: {
          type: 'string',
          format: 'password',
          example: 'Admin@123456',
          description: 'Sent only in the request body; never returned in responses.',
        },
      },
      required: ['email', 'password'],
      example: loginRequestExample,
    },
    LoginResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Login successful' },
        data: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'Short-lived JWT access token',
            },
            refreshToken: {
              type: 'string',
              description: 'Opaque refresh token for rotation (not the database hash)',
            },
            user: { $ref: '#/components/schemas/AuthUser' },
          },
          required: ['accessToken', 'refreshToken', 'user'],
        },
      },
      required: ['success', 'message', 'data'],
      example: loginResponseExample,
    },
    RefreshTokenRequest: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', description: 'Refresh token from login or prior refresh' },
      },
      required: ['refreshToken'],
      example: refreshTokenRequestExample,
    },
    RefreshTokenResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Token refreshed successfully' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: {
              type: 'string',
              description: 'New refresh token (previous one is revoked)',
            },
          },
          required: ['accessToken', 'refreshToken'],
        },
      },
      required: ['success', 'message', 'data'],
      example: refreshTokenResponseExample,
    },
    RegisterCompanyRequest: {
      type: 'object',
      properties: {
        company: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Acme Corp' },
            document: { type: 'string', example: '12345678000199' },
            email: { type: 'string', format: 'email', example: 'contact@acme.com' },
            phone: { type: 'string', example: '+5511999999999' },
          },
          required: ['name', 'document', 'email'],
        },
        admin: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'admin@acme.com' },
            password: { type: 'string', format: 'password', minLength: 8 },
          },
          required: ['firstName', 'lastName', 'email', 'password'],
        },
      },
      required: ['company', 'admin'],
    },
    RegisterCompanyResponse: {
      type: 'object',
      properties: {
        company: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
        admin: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN'] },
          },
        },
      },
    },
    AuthUser: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] },
      },
    },
    CurrentUser: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] },
      },
    },
    AuthMeResponse: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
      required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    },
    CompanyProfile: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        document: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    UpdateCompanyRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
      },
    },
    User: {
      type: 'object',
      description: 'User profile without password or sensitive fields.',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
      example: userResponseExample,
    },
    CreateUserRequest: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Maria' },
        lastName: { type: 'string', example: 'Silva' },
        email: { type: 'string', format: 'email', example: 'maria.silva@stockflow.com' },
        password: {
          type: 'string',
          minLength: 8,
          format: 'password',
          description: 'Minimum 8 characters. Never returned in API responses.',
        },
        role: { type: 'string', enum: ['MANAGER', 'USER'], example: 'USER' },
      },
      required: ['firstName', 'lastName', 'email', 'password', 'role'],
      example: createUserRequestExample,
    },
    UpdateUserRequest: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
      },
    },
    PaginatedUsersResponse: {
      allOf: [
        { $ref: '#/components/schemas/PaginatedResponse' },
        {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Users retrieved successfully' },
            data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
            pagination: { $ref: '#/components/schemas/PaginationMeta' },
          },
        },
      ],
      example: {
        success: true,
        message: 'Users retrieved successfully',
        data: paginatedUsersResponseExample.data,
        pagination: paginatedUsersResponseExample.pagination,
      },
    },
    UsersPaginationMeta: {
      type: 'object',
      properties: {
        page: { type: 'integer', example: 1 },
        limit: { type: 'integer', example: 10 },
        totalItems: { type: 'integer', example: 50 },
        totalPages: { type: 'integer', example: 5 },
        hasNextPage: { type: 'boolean', example: true },
        hasPreviousPage: { type: 'boolean', example: false },
      },
      required: ['page', 'limit', 'totalItems', 'totalPages', 'hasNextPage', 'hasPreviousPage'],
    },
    Category: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    CreateCategoryRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['name'],
    },
    UpdateCategoryRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
      },
    },
    PaginatedCategoriesResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
        pagination: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    Supplier: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        corporateName: { type: 'string' },
        tradeName: { type: 'string' },
        document: { type: 'string' },
        email: { type: 'string', nullable: true },
        phone: { type: 'string', nullable: true },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    CreateSupplierRequest: {
      type: 'object',
      properties: {
        corporateName: { type: 'string' },
        tradeName: { type: 'string' },
        document: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
      },
      required: ['corporateName', 'tradeName', 'document'],
    },
    UpdateSupplierRequest: {
      type: 'object',
      properties: {
        corporateName: { type: 'string' },
        tradeName: { type: 'string' },
        document: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
      },
    },
    PaginatedSuppliersResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Supplier' } },
        pagination: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    Product: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        categoryId: { type: 'string', nullable: true },
        supplierId: { type: 'string', nullable: true },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        sku: { type: 'string' },
        barcode: { type: 'string', nullable: true },
        price: { type: 'number' },
        quantity: { type: 'integer' },
        minimumStock: { type: 'integer' },
        active: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    CreateProductRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        sku: { type: 'string' },
        price: { type: 'number', exclusiveMinimum: 0 },
        quantity: { type: 'integer', minimum: 0, default: 0 },
        minimumStock: { type: 'integer', minimum: 0, default: 0 },
        active: { type: 'boolean', default: true },
        categoryId: { type: 'string' },
        supplierId: { type: 'string' },
        barcode: { type: 'string' },
      },
      required: ['name', 'sku', 'price'],
    },
    UpdateProductRequest: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        sku: { type: 'string' },
        price: { type: 'number', exclusiveMinimum: 0 },
        quantity: { type: 'integer', minimum: 0 },
        minimumStock: { type: 'integer', minimum: 0 },
        active: { type: 'boolean' },
        categoryId: { type: 'string', nullable: true },
        supplierId: { type: 'string', nullable: true },
        barcode: { type: 'string', nullable: true },
      },
    },
    PaginatedProductsResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
        pagination: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    LowStockProduct: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        sku: { type: 'string' },
        quantity: { type: 'integer', minimum: 0 },
        minimumStock: { type: 'integer', minimum: 0 },
        active: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
      required: [
        'id',
        'name',
        'sku',
        'quantity',
        'minimumStock',
        'active',
        'createdAt',
        'updatedAt',
      ],
    },
    PaginatedLowStockProductsResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/LowStockProduct' } },
        pagination: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    StockMovement: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        productId: { type: 'string' },
        userId: { type: 'string' },
        type: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT'] },
        quantity: { type: 'integer' },
        previousQuantity: { type: 'integer' },
        newQuantity: { type: 'integer' },
        reason: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    StockMovementListItem: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        productId: { type: 'string' },
        productName: { type: 'string' },
        userId: { type: 'string' },
        userName: { type: 'string' },
        userEmail: { type: 'string', format: 'email' },
        type: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT'] },
        quantity: { type: 'integer' },
        previousQuantity: { type: 'integer' },
        newQuantity: { type: 'integer' },
        reason: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    PaginatedStockMovementsResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/StockMovementListItem' } },
        pagination: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    CreateStockMovementRequest: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT'] },
        quantity: { type: 'integer', minimum: 1 },
        reason: { type: 'string' },
      },
      required: ['type', 'quantity'],
    },
    InventoryMovement: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        productId: { type: 'string' },
        userId: { type: 'string' },
        type: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT'] },
        quantity: { type: 'integer' },
        previousQuantity: { type: 'integer' },
        newQuantity: { type: 'integer' },
        reason: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    CreateMovementRequest: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        type: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT'] },
        quantity: { type: 'integer' },
        reason: { type: 'string' },
      },
      required: ['productId', 'type', 'quantity'],
    },
    PaginatedMovementsResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/InventoryMovement' } },
        pagination: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    AuditLog: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        userId: { type: 'string', nullable: true },
        action: {
          type: 'string',
          enum: [
            'CREATE',
            'UPDATE',
            'DELETE',
            'CREATE_USER',
            'UPDATE_USER',
            'DELETE_USER',
            'CREATE_PRODUCT',
            'UPDATE_PRODUCT',
            'DELETE_PRODUCT',
            'CREATE_STOCK_MOVEMENT',
            'LOGIN',
            'LOGOUT',
            'REFRESH',
            'REFRESH_TOKEN',
            'STOCK_ENTRY',
            'STOCK_EXIT',
            'STOCK_ADJUSTMENT',
          ],
        },
        entity: { type: 'string' },
        entityId: { type: 'string', nullable: true },
        metadata: { type: 'object', nullable: true },
        oldValue: { type: 'object', nullable: true },
        newValue: { type: 'object', nullable: true },
        ipAddress: { type: 'string', nullable: true },
        userAgent: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    PaginatedAuditLogsResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/AuditLog' } },
        pagination: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    DashboardSummary: {
      type: 'object',
      properties: {
        totalUsers: { type: 'integer', example: 10 },
        totalCategories: { type: 'integer', example: 8 },
        totalSuppliers: { type: 'integer', example: 5 },
        totalProducts: { type: 'integer', example: 120 },
        activeProducts: { type: 'integer', example: 110 },
        inactiveProducts: { type: 'integer', example: 10 },
        lowStockProducts: { type: 'integer', example: 7 },
        totalInventoryMovements: { type: 'integer', example: 350 },
        entriesToday: { type: 'integer', example: 20 },
        exitsToday: { type: 'integer', example: 12 },
        adjustmentsToday: { type: 'integer', example: 2 },
      },
      required: [
        'totalUsers',
        'totalCategories',
        'totalSuppliers',
        'totalProducts',
        'activeProducts',
        'inactiveProducts',
        'lowStockProducts',
        'totalInventoryMovements',
        'entriesToday',
        'exitsToday',
        'adjustmentsToday',
      ],
    },
    DashboardLowStockProduct: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        sku: { type: 'string' },
        quantity: { type: 'integer' },
        minimumStock: { type: 'integer' },
        category: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
        supplier: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
    DashboardRecentMovement: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT'] },
        quantity: { type: 'integer' },
        previousQuantity: { type: 'integer' },
        newQuantity: { type: 'integer' },
        reason: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            sku: { type: 'string' },
          },
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
          },
        },
      },
    },
  },
  responses: {
    Ok: {
      description: 'Successful operation',
    },
    Created: {
      description: 'Resource created successfully',
    },
    NoContent: {
      description: 'Operation completed successfully with no response body',
    },
    BadRequest: {
      description: 'Validation error or invalid request (query params)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: validationErrorExample,
        },
      },
    },
    Unauthorized: {
      description: 'Missing or invalid JWT token',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: unauthorizedErrorExample,
        },
      },
    },
    Forbidden: {
      description: 'Insufficient role permissions (RBAC)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: forbiddenErrorExample,
        },
      },
    },
    NotFound: {
      description: 'Resource not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    Conflict: {
      description: 'Resource conflict (duplicate or business rule)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    TooManyRequests: {
      description: 'Rate limit exceeded (global, login, refresh, or register limiter)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: {
            success: false,
            message: 'Too many requests',
            error: {
              code: 'TOO_MANY_REQUESTS',
              details: [],
            },
            requestId: '550e8400-e29b-41d4-a716-446655440000',
          },
        },
      },
    },
    InternalServerError: {
      description: 'Unexpected server error',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
  },
  parameters: {
    AuthorizationHeader: {
      name: 'Authorization',
      in: 'header',
      required: true,
      description: 'JWT Bearer token. Format: `Bearer <accessToken>`',
      schema: { type: 'string', example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
    RequestIdHeader: {
      name: 'X-Request-ID',
      in: 'header',
      required: false,
      description:
        'Optional client-provided request identifier (UUID). If omitted, the API generates one and returns it in the response header.',
      schema: {
        type: 'string',
        format: 'uuid',
        example: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
    PageQuery: {
      name: 'page',
      in: 'query',
      description: 'Page number (1-based)',
      schema: { type: 'integer', minimum: 1, default: 1, example: 1 },
    },
    PageSizeQuery: {
      name: 'pageSize',
      in: 'query',
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    },
    LimitQuery: {
      name: 'limit',
      in: 'query',
      description: 'Number of items per page (max 100)',
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    },
    SortOrderQuery: {
      name: 'sortOrder',
      in: 'query',
      schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    },
    SearchQuery: {
      name: 'search',
      in: 'query',
      schema: { type: 'string' },
      description: 'Case-insensitive search',
    },
    StatusFilterQuery: {
      name: 'status',
      in: 'query',
      schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
    },
    UsersSortByQuery: {
      name: 'sortBy',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['createdAt', 'firstName', 'lastName', 'email', 'role', 'status'],
        default: 'createdAt',
      },
    },
    UserRoleFilterQuery: {
      name: 'role',
      in: 'query',
      description: 'Exact role match',
      schema: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'] },
    },
    UserNameFilterQuery: {
      name: 'name',
      in: 'query',
      description: 'Case-insensitive partial match on first or last name',
      schema: { type: 'string', example: 'vivi' },
    },
    UserEmailFilterQuery: {
      name: 'email',
      in: 'query',
      description: 'Case-insensitive partial match on email',
      schema: { type: 'string', example: 'gmail' },
    },
    CategoriesSortByQuery: {
      name: 'sortBy',
      in: 'query',
      schema: { type: 'string', enum: ['name', 'createdAt', 'status'], default: 'name' },
    },
    SuppliersSortByQuery: {
      name: 'sortBy',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['corporateName', 'tradeName', 'createdAt', 'status'],
        default: 'corporateName',
      },
    },
    ProductsSortByQuery: {
      name: 'sortBy',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['name', 'sku', 'quantity', 'createdAt', 'price'],
        default: 'name',
      },
    },
    ProductNameFilterQuery: {
      name: 'name',
      in: 'query',
      description: 'Case-insensitive partial match on product name',
      schema: { type: 'string', example: 'notebook' },
    },
    ProductSkuFilterQuery: {
      name: 'sku',
      in: 'query',
      description: 'Case-insensitive partial match on SKU',
      schema: { type: 'string', example: 'NB-001' },
    },
    ProductActiveFilterQuery: {
      name: 'active',
      in: 'query',
      description: 'Filter by active status',
      schema: { type: 'boolean' },
    },
    CategoryIdFilterQuery: {
      name: 'categoryId',
      in: 'query',
      schema: { type: 'string' },
    },
    SupplierIdFilterQuery: {
      name: 'supplierId',
      in: 'query',
      schema: { type: 'string' },
    },
    LowStockFilterQuery: {
      name: 'lowStock',
      in: 'query',
      schema: { type: 'boolean' },
      description: 'When true, returns products where quantity <= minimumStock',
    },
    StockMovementProductIdFilterQuery: {
      name: 'productId',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by product ID (must exist in the company)',
    },
    StockMovementUserIdFilterQuery: {
      name: 'userId',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by user who registered the movement',
    },
    StockMovementTypeFilterQuery: {
      name: 'type',
      in: 'query',
      schema: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT'] },
    },
    StockMovementStartDateFilterQuery: {
      name: 'startDate',
      in: 'query',
      schema: { type: 'string', format: 'date-time' },
      description: 'Inclusive lower bound for createdAt',
    },
    StockMovementEndDateFilterQuery: {
      name: 'endDate',
      in: 'query',
      schema: { type: 'string', format: 'date-time' },
      description: 'Inclusive upper bound for createdAt',
    },
    AuditSortByQuery: {
      name: 'sortBy',
      in: 'query',
      schema: { type: 'string', enum: ['createdAt', 'action', 'entity'], default: 'createdAt' },
    },
    AuditActionFilterQuery: {
      name: 'action',
      in: 'query',
      schema: {
        type: 'string',
        enum: [
          'CREATE',
          'UPDATE',
          'DELETE',
          'CREATE_USER',
          'UPDATE_USER',
          'DELETE_USER',
          'CREATE_PRODUCT',
          'UPDATE_PRODUCT',
          'DELETE_PRODUCT',
          'CREATE_STOCK_MOVEMENT',
          'LOGIN',
          'LOGOUT',
          'REFRESH',
          'REFRESH_TOKEN',
          'STOCK_ENTRY',
          'STOCK_EXIT',
          'STOCK_ADJUSTMENT',
        ],
      },
    },
    AuditEntityFilterQuery: {
      name: 'entity',
      in: 'query',
      schema: { type: 'string', example: 'PRODUCT' },
    },
    AuditUserIdFilterQuery: {
      name: 'userId',
      in: 'query',
      schema: { type: 'string' },
    },
    RecentMovementsLimitQuery: {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
    },
    IdPath: {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    },
  },
} as const
