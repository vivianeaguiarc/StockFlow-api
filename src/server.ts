import 'dotenv/config'

import { createApp } from './app.js'
import { env } from './config/env.js'
import { validateProductionEnv } from './config/validate-production-env.js'

validateProductionEnv()

const app = createApp()

// Render injects PORT via process.env; validated in config/env.ts (default 3333)
const port = env.PORT

app.listen(port, env.HOST, () => {
  console.warn(
    JSON.stringify({
      level: 'info',
      message: 'StockFlow API started',
      host: env.HOST,
      port,
      environment: env.NODE_ENV,
      apiPrefix: env.API_PREFIX,
      timestamp: new Date().toISOString(),
    }),
  )
})
