import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // 获取API前缀
  const apiPrefix = configService.get('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);
  
  // 启用CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:3001'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // 使用安全头
  app.use(helmet());
  
  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 剔除不在DTO中定义的属性
      transform: true, // 自动转换类型
      forbidNonWhitelisted: true, // 对非白名单属性抛出异常
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式转换
      },
    }),
  );
  
  // 设置Swagger文档
  const options = new DocumentBuilder()
    .setTitle('TSB 战队管理系统API')
    .setDescription('The Strongest Battlegrounds 战队管理系统的API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  
  // 获取应用端口
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`应用程序已启动: http://localhost:${port}/${apiPrefix}`);
  console.log(`Swagger文档: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
