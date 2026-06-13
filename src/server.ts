import 'dotenv/config'

import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

app.listen(env.PORT, env.HOST, () => {
  console.warn(
    JSON.stringify({
      level: 'info',
      message: 'StockFlow API started',
      host: env.HOST,
      port: env.PORT,
      environment: env.NODE_ENV,
      apiPrefix: env.API_PREFIX,
      timestamp: new Date().toISOString(),
    }),
  )
})
