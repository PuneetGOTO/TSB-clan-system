const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 检查.env文件是否存在
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('未找到.env文件，正在从.env.example复制...');
  fs.copyFileSync(
    path.resolve(__dirname, '../.env.example'),
    envPath
  );
  console.log('.env文件已创建');
}

// 检查PostgreSQL服务是否在运行
try {
  console.log('正在检查PostgreSQL服务...');
  
  // 尝试通过PostgreSQL命令行工具检查服务状态
  // 注意：这可能需要根据PostgreSQL安装方式进行调整
  try {
    execSync('pg_isready', { stdio: 'ignore' });
    console.log('PostgreSQL服务已运行');
  } catch (error) {
    console.warn('PostgreSQL服务可能未运行，请确认数据库服务已启动');
    console.warn('如果您使用的是Docker，请确保PostgreSQL容器已启动');
  }
  
  // 初始化数据库并运行迁移
  console.log('正在初始化数据库...');
  require('../dist/database/init-db');
  
  // 等待数据库初始化完成
  setTimeout(() => {
    // 启动NestJS应用
    console.log('正在启动应用...');
    const nestProcess = spawn('node', ['dist/main'], { stdio: 'inherit' });
    
    // 监听进程事件
    nestProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`应用程序退出，退出码: ${code}`);
      }
    });
    
    // 处理SIGINT信号
    process.on('SIGINT', () => {
      console.log('正在关闭应用...');
      nestProcess.kill('SIGINT');
      process.exit(0);
    });
  }, 2000);  // 等待2秒让数据库初始化完成
  
} catch (error) {
  console.error('启动应用时出错:', error);
}
