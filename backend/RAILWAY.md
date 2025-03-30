# Railway部署指南

本分支(`railway-final`)专为Railway平台优化，解决了构建超时问题。

## 部署步骤

1. 登录Railway平台
2. 创建新项目，选择"Deploy from GitHub repo"
3. 选择仓库：`PuneetGOTO/TSB-clan-system`
4. 选择分支：`railway-final`
5. **关键**: 在高级设置中设置部署目录为`/backend`
6. 配置以下环境变量:
   - `NODE_ENV=production`
   - `JWT_SECRET=[安全随机字符串]`
   - 如使用Railway的PostgreSQL，数据库变量会自动配置

## 部署要点

- 本分支采用极简package.json配置
- 移除了所有开发依赖
- 简化了构建和启动命令
- 保留必要的生产依赖

## 备注

如果构建仍然超时，尝试在Railway控制台手动部署，并增加构建超时时间限制。
