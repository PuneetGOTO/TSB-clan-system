# TSB战队系统后端

## Railway部署指南

本分支为Railway部署优化版，使用Docker部署方案，避免构建超时问题。

### 部署步骤

1. 在Railway上创建新项目
2. 选择"Deploy from GitHub repo"
3. 选择仓库 `PuneetGOTO/TSB-clan-system`
4. 选择分支 `minimal-deploy` 
5. **重要**: 设置部署目录为 `/backend`
6. 配置以下环境变量:
   - `NODE_ENV=production`
   - `JWT_SECRET=[安全的随机字符串]`
   - 数据库连接信息(如果使用Railway的PostgreSQL服务，会自动配置)

### 优化说明

- 使用多阶段Docker构建减小镜像大小
- 排除不必要文件加快构建速度
- 添加健康检查确保服务可靠性
- 设置自动重启策略
