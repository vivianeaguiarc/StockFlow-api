export type ServiceStatus = 'up' | 'down'

export type HealthResponseDto = {
  status: 'ok'
  service: string
  timestamp: string
}

export type HealthLiveResponseDto = {
  status: 'ok'
  timestamp: string
}

export type HealthReadyResponseDto = {
  status: 'ready' | 'not_ready'
  services: {
    database: ServiceStatus
    redis: ServiceStatus
  }
}

export type HealthDetailsResponseDto = {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  environment: string
  uptime: number
  services: {
    database: {
      status: ServiceStatus
    }
    redis: {
      status: ServiceStatus
    }
  }
  timestamp: string
}
