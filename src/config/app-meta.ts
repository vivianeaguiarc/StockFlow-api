import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const packageJson = require('../../package.json') as { version: string }

export const APP_NAME = 'StockFlow API'
export const APP_VERSION = packageJson.version
