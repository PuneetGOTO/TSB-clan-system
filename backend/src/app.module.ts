import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClansModule } from './clans/clans.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { TasksModule } from './tasks/tasks.module';
import { HealthModule } from './health/health.module';
import { getDatabaseConfig } from './database/database.providers';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: ['.env', '.env.development.local', '.env.development'],
    }),
    
    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    }),
    
    // 功能模块
    AuthModule,
    UsersModule,
    ClansModule,
    AnnouncementsModule,
    TasksModule,
    HealthModule,
  ],
  providers: [
    // 全局应用JWT认证守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
