import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_DATABASE', 'tsb'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
    logging: configService.get('DB_LOGGING', 'false') === 'true',
    // 连接池配置
    poolSize: 60, // 最大连接数，匹配目标并发用户数
    connectionTimeout: 20000, // 连接超时时间（毫秒）
    maxQueryExecutionTime: 10000, // 查询执行最大时间（毫秒）
    // 额外配置
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    retryAttempts: 3, // 连接失败重试次数
    retryDelay: 3000, // 重试延迟（毫秒）
    // 缓存配置
    cache: {
      duration: 30000, // 缓存持续时间（毫秒）
    },
  };
};
