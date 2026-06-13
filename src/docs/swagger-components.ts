export const swaggerComponents = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token obtained from POST /api/auth/login',
    },
  },
  schemas: {
    ErrorResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: 'Invalid email or password' },
      },
      required: ['status', 'message'],
    },
    PaginationMeta: {
      type: 'object',
      properties: {
        page: { type: 'integer', example: 1 },
        pageSize: { type: 'integer', example: 10 },
        totalItems: { type: 'integer', example: 100 },
        totalPages: { type: 'integer', example: 10 },
      },
      required: ['page', 'pageSize', 'totalItems', 'totalPages'],
    },
    HealthResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'StockFlow API' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
    LoginRequest: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'admin@stockflow.com' },
        password: { type: 'string', format: 'password', example: 'Admin@123456' },
      },
      required: ['email', 'password'],
    },
    LoginResponse: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        user: { $ref: '#/components/schemas/AuthUser' },
      },
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
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      },
    },
    CurrentUser: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
      },
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
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    CreateUserRequest: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        role: { type: 'string', enum: ['MANAGER', 'EMPLOYEE'] },
      },
      required: ['firstName', 'lastName', 'email', 'password', 'role'],
    },
    UpdateUserRequest: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
      },
    },
    PaginatedUsersResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
        meta: { $ref: '#/components/schemas/PaginationMeta' },
      },
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
        meta: { $ref: '#/components/schemas/PaginationMeta' },
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
        meta: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    Product: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        categoryId: { type: 'string' },
        supplierId: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        sku: { type: 'string' },
        barcode: { type: 'string', nullable: true },
        costPrice: { type: 'number' },
        salePrice: { type: 'number' },
        quantity: { type: 'integer' },
        minimumStock: { type: 'integer' },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
    CreateProductRequest: {
      type: 'object',
      properties: {
        categoryId: { type: 'string' },
        supplierId: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        sku: { type: 'string' },
        barcode: { type: 'string' },
        costPrice: { type: 'number', minimum: 0 },
        salePrice: { type: 'number', minimum: 0 },
        quantity: { type: 'integer', minimum: 0, default: 0 },
        minimumStock: { type: 'integer', minimum: 0, default: 0 },
      },
      required: ['categoryId', 'supplierId', 'name', 'sku', 'costPrice', 'salePrice'],
    },
    UpdateProductRequest: {
      type: 'object',
      properties: {
        categoryId: { type: 'string' },
        supplierId: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        sku: { type: 'string' },
        barcode: { type: 'string' },
        costPrice: { type: 'number', minimum: 0 },
        salePrice: { type: 'number', minimum: 0 },
        quantity: { type: 'integer', minimum: 0 },
        minimumStock: { type: 'integer', minimum: 0 },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
      },
    },
    PaginatedProductsResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
        meta: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    InventoryMovement: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        productId: { type: 'string' },
        userId: { type: 'string' },
        type: { type: 'string', enum: ['ENTRY', 'EXIT', 'ADJUSTMENT'] },
        quantity: { type: 'integer' },
        previousQuantity: { type: 'integer' },
        newQuantity: { type: 'integer' },
        reason: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    CreateMovementRequest: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        type: { type: 'string', enum: ['ENTRY', 'EXIT', 'ADJUSTMENT'] },
        quantity: { type: 'integer' },
        reason: { type: 'string' },
      },
      required: ['productId', 'type', 'quantity', 'reason'],
    },
    PaginatedMovementsResponse: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/InventoryMovement' } },
        meta: { $ref: '#/components/schemas/PaginationMeta' },
      },
    },
    AuditLog: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        companyId: { type: 'string' },
        userId: { type: 'string' },
        action: {
          type: 'string',
          enum: [
            'CREATE',
            'UPDATE',
            'DELETE',
            'LOGIN',
            'LOGOUT',
            'STOCK_ENTRY',
            'STOCK_EXIT',
            'STOCK_ADJUSTMENT',
          ],
        },
        entity: { type: 'string' },
        entityId: { type: 'string' },
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
        meta: { $ref: '#/components/schemas/PaginationMeta' },
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
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
        supplier: {
          type: 'object',
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
        type: { type: 'string', enum: ['ENTRY', 'EXIT', 'ADJUSTMENT'] },
        quantity: { type: 'integer' },
        previousQuantity: { type: 'integer' },
        newQuantity: { type: 'integer' },
        reason: { type: 'string' },
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
    BadRequest: {
      description: 'Validation error or invalid request',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    Unauthorized: {
      description: 'Missing or invalid JWT token',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    Forbidden: {
      description: 'Insufficient role permissions',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
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
    PageQuery: {
      name: 'page',
      in: 'query',
      schema: { type: 'integer', minimum: 1, default: 1 },
    },
    PageSizeQuery: {
      name: 'pageSize',
      in: 'query',
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
      schema: { type: 'string', enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'] },
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
        enum: ['name', 'sku', 'quantity', 'createdAt', 'salePrice'],
        default: 'name',
      },
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
          'LOGIN',
          'LOGOUT',
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
