import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('健康检查')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: '健康检查端点' })
  @ApiResponse({ status: 200, description: '应用程序运行正常' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
    };
  }
}
