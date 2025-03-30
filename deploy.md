# TSB项目部署指南

由于Railway的构建时间限制，我们需要采用以下优化部署流程：

## 预构建部署方案

1. **本地执行构建**
   ```bash
   # 在backend目录下
   cd backend
   npm install
   npm run build
   ```

2. **创建生产分支**
   ```bash
   git checkout -b production
   ```

3. **准备生产文件**
   - 保留以下文件/目录:
     - backend/dist/
     - backend/package.json
     - backend/package-lock.json
     - backend/node_modules/ (可选)
   - 删除其他开发文件

4. **创建简化的入口点**
   - 在根目录创建最小化package.json
   - 只包含启动命令

5. **推送到GitHub**
   ```bash
   git add .
   git commit -m "Add production build"
   git push -u origin production
   ```

6. **在Railway上部署production分支**
   - 选择production分支
   - 不需要构建步骤，只需配置启动命令

## 使用Docker部署

另一种可行方案是使用预构建的Docker映像部署：

1. **在本地构建Docker映像**
   ```bash
   docker build -t tsb-backend ./backend
   ```

2. **保存映像到仓库**
   ```bash
   docker push [your-registry]/tsb-backend:latest
   ```

3. **在Railway上使用Docker部署**
   - 在新服务中选择"Deploy from Image"
   - 引用您的Docker映像

## 使用其他平台

以下平台对Node.js应用友好且有免费层级：
- Render.com
- Fly.io
- Koyeb
- Vercel (对前端更好)
