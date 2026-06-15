const secured = [{ bearerAuth: [] as string[] }]

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
  ...basePaginationParams,
  { $ref: '#/components/parameters/ProductsSortByQuery' },
  { $ref: '#/components/parameters/StatusFilterQuery' },
  { $ref: '#/components/parameters/CategoryIdFilterQuery' },
  { $ref: '#/components/parameters/SupplierIdFilterQuery' },
  { $ref: '#/components/parameters/LowStockFilterQuery' },
  { $ref: '#/components/parameters/SearchQuery' },
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
      description: 'Legacy-compatible health endpoint. Returns basic API availability.',
      responses: {
        '200': {
          description: 'Service is available',
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
        'Returns JWT access and refresh tokens. Rate limited to 5 attempts per 15 minutes per IP (configurable via RATE_LIMIT_LOGIN_* env vars).',
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
        'Rotates the refresh token and returns a new access token pair. The previous refresh token is revoked.',
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
        '401': { $ref: '#/components/responses/Unauthorized' },
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
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
          },
        },
      },
      responses: {
        '204': { description: 'Logout successful' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
  '/api/v1/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get authenticated user profile',
      description: 'Returns the current user profile. Requires Bearer token.',
      security: secured,
      responses: {
        '200': {
          description: 'Authenticated user profile',
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
      description: 'Requires ADMIN role. Bearer token required.',
      security: secured,
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
      description:
        'Requires ADMIN role and Bearer token. Supports pagination (page, limit) and optional filters (name, email, role). Example: /api/v1/users?page=1&limit=10&role=MANAGER',
      security: secured,
      parameters: usersListParams,
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
      description: 'Requires ADMIN or MANAGER role. Bearer token required.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '200': {
          description: 'User details',
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
      description: 'Requires ADMIN or MANAGER role. Bearer token required.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
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
        'Performs a soft delete by setting deletedAt. The record remains in the database but is excluded from listings and lookups. Requires ADMIN role and Bearer token.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '204': { description: 'User soft-deleted successfully' },
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
      description: 'Requires ADMIN role.',
      security: secured,
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: {
        '204': { description: 'Product deleted' },
        ...defaultErrors,
      },
    },
  },
  '/api/v1/inventory/movements': {
    post: {
      tags: ['Inventory'],
      summary: 'Create inventory movement',
      description:
        'Registers ENTRY, EXIT or ADJUSTMENT. ADJUSTMENT uses quantity as the final stock value.',
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
