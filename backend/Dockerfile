FROM node:18-alpine AS build

# 设置工作目录
WORKDIR /app

# 将package.json和package-lock.json（如果存在）复制到工作目录
COPY package*.json ./

# 安装依赖，跳过开发依赖
RUN npm install --omit=dev

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像
FROM node:18-alpine AS production

# 设置工作目录
WORKDIR /app

# 从构建阶段复制package.json和依赖
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露应用端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/main"]

# 添加注释以触发重新部署
