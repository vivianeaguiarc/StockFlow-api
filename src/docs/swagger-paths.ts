const secured = [{ BearerAuth: [] as string[] }]

const protectedHeaders = [{ $ref: '#/components/parameters/RequestIdHeader' }]

const defaultErrors = {
  '400': { $ref: '#/components/responses/BadRequest' },
  '401': { $ref: '#/components/responses/Unauthorized' },
  '403': { $ref: '#/components/responses/Forbidden' },
  '404': { $ref: '#/components/responses/NotFound' },
  '500': { $ref: '#/components/responses/InternalServerError' },
}

const basePaginationParams = [
  { $ref: '#/components/parameters/PageQuery' },
  { $ref: '#/components/parameters/PageSizeQuery' },
  { $ref: '#/components/parameters/SortOrderQuery' },
]

const usersListParams = [
  { $ref: '#/components/parameters/PageQuery' },
  { $ref: '#/components/parameters/LimitQuery' },
  { $ref: '#/components/parameters/SortOrderQuery' },
  { $ref: '#/components/parameters/UsersSortByQuery' },
  { $ref: '#/components/parameters/UserNameFilterQuery' },
  { $ref: '#/components/parameters/UserEmailFilterQuery' },
  { $ref: '#/components/parameters/UserRoleFilterQuery' },
]

const categoriesListParams = [
  ...basePaginationParams,
  { $ref: '#/components/parameters/CategoriesSortByQuery' },
  { $ref: '#/components/parameters/StatusFilterQuery' },
  { $ref: '#/components/parameters/SearchQuery' },
]

const suppliersListParams = [
  ...basePaginationParams,
  { $ref: '#/components/parameters/SuppliersSortByQuery' },
  { $ref: '#/components/parameters/StatusFilterQuery' },
  { $ref: '#/components/parameters/SearchQuery' },
]

const productsListParams = [
  { $ref: '#/components/parameters/PageQuery' },
  { $ref: '#/components/parameters/LimitQuery' },
  { $ref: '#/components/parameters/SortOrderQuery' },
  { $ref: '#/components/parameters/ProductsSortByQuery' },
  { $ref: '#/components/parameters/ProductNameFilterQuery' },
  { $ref: '#/components/parameters/ProductSkuFilterQuery' },
  { $ref: '#/components/parameters/ProductActiveFilterQuery' },
  { $ref: '#/components/parameters/CategoryIdFilterQuery' },
  { $ref: '#/components/parameters/SupplierIdFilterQuery' },
  { $ref: '#/components/parameters/LowStockFilterQuery' },
]

const lowStockProductsListParams = [
  { $ref: '#/components/parameters/PageQuery' },
  { $ref: '#/components/parameters/LimitQuery' },
  { $ref: '#/components/parameters/ProductNameFilterQuery' },
  { $ref: '#/components/parameters/ProductSkuFilterQuery' },
]

const stockMovementsListParams = [
  { $ref: '#/components/parameters/PageQuery' },
  { $ref: '#/components/parameters/LimitQuery' },
  { $ref: '#/components/parameters/StockMovementProductIdFilterQuery' },
  { $ref: '#/components/parameters/StockMovementUserIdFilterQuery' },
  { $ref: '#/components/parameters/StockMovementTypeFilterQuery' },
  { $ref: '#/components/parameters/StockMovementStartDateFilterQuery' },
  { $ref: '#/components/parameters/StockMovementEndDateFilterQuery' },
]

const auditLogsListParams = [
  ...basePaginationParams,
  { $ref: '#/components/parameters/AuditSortByQuery' },
  { $ref: '#/components/parameters/AuditActionFilterQuery' },
  { $ref: '#/components/parameters/AuditEntityFilterQuery' },
  { $ref: '#/components/parameters/AuditUserIdFilterQuery' },
]

const paginationParams = basePaginationParams

export const swaggerPaths = {
  '/': {
    get: {
      tags: ['Root'],
      summary: 'API root',
      description: 'Public metadata and links to documentation and health checks.',
      responses: {
        '200': {
          description: 'API metadata',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RootResponse' },
            },
          },
        },
      },
    },
    head: {
      tags: ['Root'],
      summary: 'API root (HEAD)',
      description: 'Lightweight availability check for the API root.',
      responses: {
        '200': {
          description: 'API is reachable',
        },
      },
    },
  },
  '/api/v1/health': {
    get: {
      tags: ['Health'],
      summary: 'Basic health check',
      description:
        'Returns API availability with process uptime and environment. Suitable for load balancer liveness probes.',
      parameters: protectedHeaders,
      responses: {
        '200': {
          description: 'Service is available',
          headers: {
            'X-Request-ID': {
              description: 'Unique request identifier for tracing',
              schema: { type: 'string', format: 'uuid' },
            },
          },
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' },
            },
          },
        },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/ready': {
    get: {
      tags: ['Health'],
      summary: 'Readiness probe',
      description:
        'Validates PostgreSQL connectivity before accepting traffic. Redis status is reported but does not block readiness. Returns 503 when the database is unavailable.',
      parameters: protectedHeaders,
      responses: {
        '200': {
          description: 'Application is ready to receive traffic',
          headers: {
            'X-Request-ID': {
              description: 'Unique request identifier for tracing',
              schema: { type: 'string', format: 'uuid' },
            },
          },
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReadyResponse' },
            },
          },
        },
        '503': {
          description: 'Application is not ready (PostgreSQL unavailable)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReadyResponse' },
            },
          },
        },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/health/live': {
    get: {
      tags: ['Health'],
      summary: 'Liveness probe',
      description:
        'Indicates whether the application process is running. Does not check external dependencies.',
      responses: {
        '200': {
          description: 'Application is alive',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthLiveResponse' },
            },
          },
        },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/health/ready': {
    get: {
      tags: ['Health'],
      summary: 'Readiness probe',
      description:
        'Validates essential dependencies before accepting traffic. Returns 503 when PostgreSQL is unavailable.',
      responses: {
        '200': {
          description: 'Application is ready to receive traffic',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthReadyResponse' },
            },
          },
        },
        '503': {
          description: 'Application is not ready (PostgreSQL unavailable)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthReadyResponse' },
            },
          },
        },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/health/details': {
    get: {
      tags: ['Health'],
      summary: 'Detailed health status',
      description:
        'Returns application metadata and dependency status for observability and diagnostics.',
      responses: {
        '200': {
          description: 'Detailed health information',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthDetailsResponse' },
            },
          },
        },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register company and admin user',
      description:
        'Rate limited to 10 requests per hour per IP (configurable via RATE_LIMIT_REGISTER_* env vars).',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterCompanyRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Company and admin created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterCompanyResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '409': { $ref: '#/components/responses/Conflict' },
        '429': { $ref: '#/components/responses/TooManyRequests' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Authenticate user',
      description:
        'Returns JWT access and refresh tokens. Rate limited to 5 attempts per 15 minutes per IP (configurable via RATE_LIMIT_LOGIN_* env vars). Passwords are never echoed in responses.',
      parameters: protectedHeaders,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '429': { $ref: '#/components/responses/TooManyRequests' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      description:
        'Rotates the refresh token and returns a new access token pair. The previous refresh token is revoked immediately.',
      parameters: protectedHeaders,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Tokens refreshed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '429': { $ref: '#/components/responses/TooManyRequests' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user',
      description:
        'Revokes the provided refresh token. Always returns 204, even when the token is invalid or already revoked.',
      parameters: protectedHeaders,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
          },
        },
      },
      responses: {
        '204': { $ref: '#/components/responses/NoContent' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get authenticated user profile',
      description:
        'Returns the current user profile from the database. Requires Bearer token. Response is Redis-cached (TTL 300s).',
      security: secured,
      parameters: protectedHeaders,
      responses: {
        '200': {
          description: 'Authenticated user profile (no password or tokens)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthMeResponse' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/me': {
    get: {
      tags: ['Current User'],
      summary: 'Get authenticated user profile',
      security: secured,
      responses: {
        '200': {
          description: 'Current user data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CurrentUser' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/companies/me': {
    get: {
      tags: ['Companies'],
      summary: 'Get company profile',
      security: secured,
      responses: {
        '200': {
          description: 'Company profile',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CompanyProfile' },
            },
          },
        },
        ...defaultErrors,
      },
    },
    patch: {
      tags: ['Companies'],
      summary: 'Update company profile',
      description: 'Requires ADMIN role.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateCompanyRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated company profile',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CompanyProfile' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/users': {
    post: {
      tags: ['Users'],
      summary: 'Create user',
      description:
        'Requires ADMIN role. Creates a user in the authenticated company. Password is hashed server-side and never returned.',
      security: secured,
      parameters: protectedHeaders,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUserRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'User created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
            },
          },
        },
        ...defaultErrors,
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    get: {
      tags: ['Users'],
      summary: 'List users',
      description: [
        'Requires ADMIN role. Paginated list scoped to the authenticated company.',
        'Supports filters: `name` (partial match on first/last name), `email` (partial match), `role` (exact).',
        'Results are Redis-cached (TTL 60s).',
        '',
        '**Example:** `/api/v1/users?page=1&limit=10&name=maria&email=stockflow&role=USER`',
      ].join('\n'),
      security: secured,
      parameters: [...protectedHeaders, ...usersListParams],
      responses: {
        '200': {
          description: 'Paginated users list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedUsersResponse' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by ID',
      description: 'Requires ADMIN or MANAGER role. Redis-cached (TTL 300s).',
      security: secured,
      parameters: [...protectedHeaders, { $ref: '#/components/parameters/IdPath' }],
      responses: {
        '200': {
          description: 'User details (no password fields)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
            },
          },
        },
        ...defaultErrors,
      },
    },
    patch: {
      tags: ['Users'],
      summary: 'Update user',
      description:
        'Requires ADMIN or MANAGER role. Optional password change is hashed server-side and never returned.',
      security: secured,
      parameters: [...protectedHeaders, { $ref: '#/components/parameters/IdPath' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUserRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated user',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
            },
          },
        },
        ...defaultErrors,
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    delete: {
      tags: ['Users'],
      summary: 'Soft delete user',
      description:
        'Performs a soft delete by setting deletedAt. The record remains in the database but is excluded from listings and lookups. Requires ADMIN role.',
      security: secured,
      parameters: [...protectedHeaders, { $ref: '#/components/parameters/IdPath' }],
      responses: {
        '204': { $ref: '#/components/responses/NoContent' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
        '409': { $ref: '#/components/responses/Conflict' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/categories': {
    post: {
      tags: ['Categories'],
      summary: 'Create category',
      description: 'Requires ADMIN or MANAGER role.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateCategoryRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Category created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
            },
          },
        },
        ...defaultErrors,
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    get: {
      tags: ['Categories'],
      summary: 'List categories',
      security: secured,
      parameters: categoriesListParams,
      responses: {
        '200': {
          description: 'Paginated categories list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedCategoriesResponse' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/categories/{id}': {
    get: {
      tags: ['Categories'],
      summary: 'Get category by ID',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '200': {
          description: 'Category details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
            },
          },
        },
        ...defaultErrors,
      },
    },
    patch: {
      tags: ['Categories'],
      summary: 'Update category',
      description: 'Requires ADMIN or MANAGER role.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateCategoryRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated category',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
            },
          },
        },
        ...defaultErrors,
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    delete: {
      tags: ['Categories'],
      summary: 'Soft delete category',
      description: 'Requires ADMIN role.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '204': { description: 'Category deleted' },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/suppliers': {
    post: {
      tags: ['Suppliers'],
      summary: 'Create supplier',
      description: 'Requires ADMIN or MANAGER role.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateSupplierRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Supplier created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Supplier' },
            },
          },
        },
        ...defaultErrors,
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    get: {
      tags: ['Suppliers'],
      summary: 'List suppliers',
      security: secured,
      parameters: suppliersListParams,
      responses: {
        '200': {
          description: 'Paginated suppliers list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedSuppliersResponse' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/suppliers/{id}': {
    get: {
      tags: ['Suppliers'],
      summary: 'Get supplier by ID',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '200': {
          description: 'Supplier details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Supplier' },
            },
          },
        },
        ...defaultErrors,
      },
    },
    patch: {
      tags: ['Suppliers'],
      summary: 'Update supplier',
      description: 'Requires ADMIN or MANAGER role.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateSupplierRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated supplier',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Supplier' },
            },
          },
        },
        ...defaultErrors,
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    delete: {
      tags: ['Suppliers'],
      summary: 'Soft delete supplier',
      description: 'Requires ADMIN role.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '204': { description: 'Supplier deleted' },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/products': {
    post: {
      tags: ['Products'],
      summary: 'Create product',
      description: 'Requires ADMIN or MANAGER role.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateProductRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Product created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        ...defaultErrors,
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    get: {
      tags: ['Products'],
      summary: 'List products',
      security: secured,
      parameters: productsListParams,
      responses: {
        '200': {
          description: 'Paginated products list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedProductsResponse' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/products/low-stock': {
    get: {
      tags: ['Products'],
      summary: 'List low stock products',
      description:
        'Returns active, non-deleted products where quantity <= minimumStock. Ordered by quantity ascending, then name ascending. Requires ADMIN, MANAGER or USER role.',
      security: secured,
      parameters: lowStockProductsListParams,
      responses: {
        '200': {
          description: 'Paginated low stock products list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedLowStockProductsResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/products/{id}': {
    get: {
      tags: ['Products'],
      summary: 'Get product by ID',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '200': {
          description: 'Product details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        ...defaultErrors,
      },
    },
    patch: {
      tags: ['Products'],
      summary: 'Update product',
      description: 'Requires ADMIN or MANAGER role.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateProductRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated product',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        ...defaultErrors,
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    delete: {
      tags: ['Products'],
      summary: 'Soft delete product',
      description: 'Requires ADMIN or MANAGER role. Soft deletes the product (sets deletedAt).',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '204': { description: 'Product deleted' },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/products/{productId}/stock-movements': {
    get: {
      tags: ['Stock Movements'],
      summary: 'List stock movements for a product',
      description:
        'Requires ADMIN, MANAGER or USER role. Returns paginated movement history ordered by createdAt desc.',
      security: secured,
      parameters: [
        {
          name: 'productId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
        { $ref: '#/components/parameters/PageQuery' },
        { $ref: '#/components/parameters/LimitQuery' },
        { $ref: '#/components/parameters/StockMovementUserIdFilterQuery' },
        { $ref: '#/components/parameters/StockMovementTypeFilterQuery' },
        { $ref: '#/components/parameters/StockMovementStartDateFilterQuery' },
        { $ref: '#/components/parameters/StockMovementEndDateFilterQuery' },
      ],
      responses: {
        '200': {
          description: 'Paginated stock movements for the product',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedStockMovementsResponse' },
            },
          },
        },
        ...defaultErrors,
      },
    },
    post: {
      tags: ['Products'],
      summary: 'Create stock movement for a product',
      description:
        'Requires ADMIN or MANAGER role. IN adds stock, OUT removes stock (409 if insufficient), ADJUSTMENT sets final quantity.',
      security: secured,
      parameters: [
        {
          name: 'productId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateStockMovementRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Stock movement created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StockMovement' },
            },
          },
        },
        ...defaultErrors,
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
  },
  '/api/v1/stock-movements': {
    get: {
      tags: ['Stock Movements'],
      summary: 'List stock movement history',
      description:
        'Requires ADMIN, MANAGER or USER role. Supports pagination and filters by product, user, type and date range.',
      security: secured,
      parameters: stockMovementsListParams,
      responses: {
        '200': {
          description: 'Paginated stock movement history',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedStockMovementsResponse' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/inventory/movements': {
    post: {
      tags: ['Inventory'],
      summary: 'Create inventory movement',
      description:
        'Registers IN, OUT or ADJUSTMENT. ADJUSTMENT uses quantity as the final stock value. Requires ADMIN or MANAGER role.',
      security: secured,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateMovementRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Movement created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InventoryMovement' },
            },
          },
        },
        ...defaultErrors,
      },
    },
    get: {
      tags: ['Inventory'],
      summary: 'List inventory movements',
      description: 'Requires ADMIN or MANAGER role.',
      security: secured,
      parameters: paginationParams,
      responses: {
        '200': {
          description: 'Paginated movements list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedMovementsResponse' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/inventory/movements/{id}': {
    get: {
      tags: ['Inventory'],
      summary: 'Get inventory movement by ID',
      description: 'Requires ADMIN or MANAGER role.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '200': {
          description: 'Movement details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InventoryMovement' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/audit/logs': {
    get: {
      tags: ['Audit'],
      summary: 'List audit logs',
      description: 'Requires ADMIN role. Returns logs for the authenticated company only.',
      security: secured,
      parameters: auditLogsListParams,
      responses: {
        '200': {
          description: 'Paginated audit logs',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedAuditLogsResponse' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/audit/logs/{id}': {
    get: {
      tags: ['Audit'],
      summary: 'Get audit log by ID',
      description: 'Requires ADMIN role.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '200': {
          description: 'Audit log details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuditLog' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/dashboard/summary': {
    get: {
      tags: ['Dashboard'],
      summary: 'Get company dashboard summary',
      description:
        'Requires ADMIN or MANAGER role. Returns consolidated metrics for the authenticated company.',
      security: secured,
      responses: {
        '200': {
          description: 'Dashboard summary metrics',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DashboardSummary' },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/dashboard/low-stock-products': {
    get: {
      tags: ['Dashboard'],
      summary: 'List low stock products',
      description:
        'Requires ADMIN, MANAGER or USER role. Returns active non-deleted products where quantity <= minimumStock.',
      security: secured,
      responses: {
        '200': {
          description: 'Low stock products',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/DashboardLowStockProduct' },
              },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/dashboard/recent-movements': {
    get: {
      tags: ['Dashboard'],
      summary: 'List recent inventory movements',
      description:
        'Requires ADMIN or MANAGER role. Returns the most recent stock movements for the authenticated company.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/RecentMovementsLimitQuery' }],
      responses: {
        '200': {
          description: 'Recent inventory movements',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/DashboardRecentMovement' },
              },
            },
          },
        },
        ...defaultErrors,
      },
    },
  },
} as const
