import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

// 加载环境变量
config({ path: path.resolve(__dirname, '../../.env') });

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'tsb',
  entities: [path.resolve(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.resolve(__dirname, './migrations/**/*{.ts,.js}')],
  migrationsTableName: 'migrations_history',
  synchronize: false, // 在迁移模式下关闭自动同步
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// 创建数据源
export const AppDataSource = new DataSource(options);

// 执行迁移的命令: npx typeorm-ts-node-commonjs migration:run -d src/database/migrations-config.ts
// 生成迁移的命令: npx typeorm-ts-node-commonjs migration:generate src/database/migrations/MigrationName -d src/database/migrations-config.ts
