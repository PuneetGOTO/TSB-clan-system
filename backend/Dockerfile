FROM node:16-alpine AS build

WORKDIR /usr/src/app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖
RUN npm ci

# 复制源代码
COPY . .

# 编译TypeScript
RUN npm run build

# 生产环境镜像
FROM node:16-alpine

WORKDIR /usr/src/app

# 复制package.json和package-lock.json
COPY package*.json ./

# 仅安装生产依赖
RUN npm ci --only=production

# 从构建阶段复制编译后的代码
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/.env* ./

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main"]
