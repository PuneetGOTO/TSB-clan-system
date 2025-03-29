import { exec } from 'child_process';
import { config } from 'dotenv';
import * as path from 'path';
import * as util from 'util';
import { Client } from 'pg';

// 将exec转换为Promise版本
const execPromise = util.promisify(exec);

// 加载环境变量
config({ path: path.resolve(__dirname, '../../.env') });

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

// 连接到PostgreSQL默认数据库
async function createDatabase() {
  console.log('正在检查数据库是否存在...');

  const client = new Client({
    host: DB_HOST || 'localhost',
    port: Number(DB_PORT) || 5432,
    user: DB_USERNAME || 'postgres',
    password: DB_PASSWORD || 'postgres',
    database: 'postgres', // 连接到默认数据库
  });

  try {
    await client.connect();
    
    // 检查数据库是否存在
    const checkDbResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${DB_DATABASE}'`
    );
    
    if (checkDbResult.rowCount === 0) {
      console.log(`数据库 ${DB_DATABASE} 不存在，正在创建...`);
      // 创建数据库
      await client.query(`CREATE DATABASE ${DB_DATABASE}`);
      console.log(`数据库 ${DB_DATABASE} 创建成功`);
      
      // 创建UUID扩展
      const dbClient = new Client({
        host: DB_HOST || 'localhost',
        port: Number(DB_PORT) || 5432,
        user: DB_USERNAME || 'postgres',
        password: DB_PASSWORD || 'postgres',
        database: DB_DATABASE || 'tsb',
      });
      
      await dbClient.connect();
      await dbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('UUID扩展已创建');
      await dbClient.end();
    } else {
      console.log(`数据库 ${DB_DATABASE} 已存在`);
    }
  } catch (error) {
    console.error('创建数据库时出错:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// 运行数据库迁移
async function runMigrations() {
  try {
    console.log('正在运行数据库迁移...');
    const { stdout, stderr } = await execPromise(
      'npx typeorm-ts-node-commonjs migration:run -d src/database/migrations-config.ts'
    );
    
    if (stderr) {
      console.error('迁移执行错误:', stderr);
      return;
    }
    
    console.log('迁移执行成功:', stdout);
  } catch (error) {
    console.error('运行迁移时出错:', error);
  }
}

// 创建初始超级管理员
async function createSuperAdmin() {
  try {
    console.log('正在检查超级管理员是否存在...');
    
    const client = new Client({
      host: DB_HOST || 'localhost',
      port: Number(DB_PORT) || 5432,
      user: DB_USERNAME || 'postgres',
      password: DB_PASSWORD || 'postgres',
      database: DB_DATABASE || 'tsb',
    });
    
    await client.connect();
    
    // 检查是否已有超级管理员
    const checkAdminResult = await client.query(
      `SELECT 1 FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1`
    );
    
    if (checkAdminResult.rowCount === 0) {
      console.log('未找到超级管理员，正在创建...');
      // 这里不直接在脚本中创建用户，而是给出相关说明
      console.log('请使用以下API创建超级管理员:');
      console.log('POST /api/auth/admin-register');
      console.log('或通过前端管理界面创建超级管理员');
    } else {
      console.log('超级管理员已存在');
    }
    
    await client.end();
  } catch (error) {
    console.error('检查超级管理员时出错:', error);
  }
}

// 按顺序执行初始化步骤
async function init() {
  try {
    await createDatabase();
    await runMigrations();
    await createSuperAdmin();
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('初始化数据库时出错:', error);
  }
}

// 运行初始化
init();
