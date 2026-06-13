import type { HealthResponseDto } from '../dtos/HealthResponseDto.js'

export class HealthService {
  execute(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'StockFlow API',
      timestamp: new Date().toISOString(),
    }
  }
}
