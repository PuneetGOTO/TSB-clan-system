FROM node:18-alpine AS build

# 设置工作目录
WORKDIR /app

# 只复制package.json，优化缓存
COPY package.json ./

# 安装依赖，跳过开发依赖
RUN npm install --omit=dev --no-package-lock

# 复制源代码和编译文件
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# 构建应用
RUN npm run build

# 生产镜像 - 使用更小的alpine基础镜像
FROM node:18-alpine AS production

# 设置工作目录
WORKDIR /app

# 复制package.json和生产依赖
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 暴露应用端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/main"]
