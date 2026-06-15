import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'text-summary'],
      include: [
        'src/modules/auth/services/**/*.ts',
        'src/modules/users/services/**/*.ts',
        'src/modules/audit/audit-log.service.ts',
        'src/modules/audit/services/**/*.ts',
        'src/shared/http/middlewares/**/*.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 65,
        functions: 80,
        lines: 80,
      },
    },
  },
})
