# TSB 战队管理系统 (The Strongest Battlegrounds Clan System)

一个为《最强战场》游戏设计的完整战队管理系统，包括用户认证、战队管理、公告发布和任务跟踪等功能。

## 项目架构

本项目采用前后端分离架构:

- **前端**: React + TypeScript + Ant Design
- **后端**: NestJS + TypeScript + PostgreSQL + TypeORM

### 目录结构

```
网站TSB/
├── backend/            # NestJS 后端
│   ├── src/
│   │   ├── auth/       # 身份验证模块
│   │   ├── users/      # 用户管理模块
│   │   ├── clans/      # 战队管理模块
│   │   ├── announcements/  # 公告模块
│   │   ├── tasks/      # 任务管理模块
│   │   ├── app.module.ts   # 主模块
│   │   └── main.ts     # 入口文件
│   └── ...
└── frontend/           # React 前端
    ├── src/
    │   ├── components/ # 公共组件
    │   ├── pages/      # 页面组件
    │   ├── services/   # API服务
    │   ├── hooks/      # 自定义钩子
    │   ├── utils/      # 工具函数
    │   ├── App.tsx     # 主应用组件
    │   └── index.tsx   # 入口文件
    └── ...
```

## 功能特点

- **用户管理**：注册、登录、角色管理（超级管理员、战队队长、战队成员）
- **战队管理**：创建、加入、退出战队，管理战队成员
- **公告系统**：创建、编辑、删除公告，支持置顶功能
- **任务管理**：创建、分配和跟踪任务，状态跟踪
- **权限控制**：基于角色的权限控制系统
- **二次认证**：支持双因素认证提高安全性

## 开发环境设置

### 前置要求

- Node.js (v16+)
- npm 或 yarn
- PostgreSQL

### 后端设置

1. 进入后端目录:
   ```
   cd backend
   ```

2. 安装依赖:
   ```
   npm install
   ```
   
   如果使用PowerShell遇到执行策略问题，可以使用:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   npm install
   ```

3. 配置环境变量:
   复制 `.env.example` 到 `.env` 并设置环境变量(已完成)

4. 创建数据库:
   ```
   # 使用PostgreSQL命令行
   createdb tsb
   ```

5. 运行开发服务器:
   ```
   npm run start:dev
   ```
   
   服务器将在 http://localhost:3000/api 运行，API文档将在 http://localhost:3000/api/docs 可用

### 前端设置

1. 进入前端目录:
   ```
   cd frontend
   ```

2. 安装依赖:
   ```
   npm install
   ```

3. 启动开发服务器:
   ```
   npm start
   ```
   
   前端将在 http://localhost:3001 运行

## API文档

启动后端服务后，可以通过 http://localhost:3000/api/docs 访问Swagger API文档。

## 部署指南

### Docker 部署

1. 构建镜像:
   ```
   docker-compose build
   ```

2. 启动服务:
   ```
   docker-compose up -d
   ```

### 传统部署

1. 构建前端:
   ```
   cd frontend
   npm run build
   ```

2. 构建后端:
   ```
   cd backend
   npm run build
   ```

3. 启动生产服务器:
   ```
   cd backend
   npm run start:prod
   ```

## 性能优化

- 连接池设置为最多60个并发用户
- API限流配置为每分钟60个请求
- 缓存策略已实施在常用API上

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目使用 MIT 许可证
