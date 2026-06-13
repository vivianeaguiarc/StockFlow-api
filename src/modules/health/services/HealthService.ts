import { APP_NAME, APP_VERSION } from '../../../config/app-meta.js'
import { env } from '../../../config/env.js'
import type {
  HealthDetailsResponseDto,
  HealthLiveResponseDto,
  HealthReadyResponseDto,
  HealthResponseDto,
} from '../dtos/health-response.dto.js'
import { type DependencyStatuses, HealthDependencyChecker } from './HealthDependencyChecker.js'

export class HealthService {
  constructor(
    private readonly dependencyChecker: HealthDependencyChecker = new HealthDependencyChecker(),
  ) {}

  getBasic(): HealthResponseDto {
    return {
      status: 'ok',
      service: APP_NAME,
      timestamp: new Date().toISOString(),
    }
  }

  getLive(): HealthLiveResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }

  async getReady(): Promise<{ body: HealthReadyResponseDto; httpStatus: number }> {
    const services = await this.dependencyChecker.checkAll()
    const isReady = services.database === 'up'

    return {
      body: {
        status: isReady ? 'ready' : 'not_ready',
        services,
      },
      httpStatus: isReady ? 200 : 503,
    }
  }

  async getDetails(): Promise<HealthDetailsResponseDto> {
    const services = await this.dependencyChecker.checkAll()

    return {
      status: this.resolveDetailsStatus(services),
      version: APP_VERSION,
      environment: env.NODE_ENV,
      uptime: Math.floor(process.uptime()),
      services: {
        database: { status: services.database },
        redis: { status: services.redis },
      },
      timestamp: new Date().toISOString(),
    }
  }

  private resolveDetailsStatus(services: DependencyStatuses): HealthDetailsResponseDto['status'] {
    if (services.database === 'down') {
      return 'unhealthy'
    }

    if (services.redis === 'down') {
      return 'degraded'
    }

    return 'healthy'
  }
}
