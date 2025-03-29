FROM node:16-alpine AS build

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖
RUN npm ci

# 复制源代码
COPY . .

# 设置API地址环境变量
ENV REACT_APP_API_URL=http://localhost:3000/api

# 构建应用
RUN npm run build

# 生产环境镜像 - 使用nginx提供静态文件
FROM nginx:alpine

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建好的文件
COPY --from=build /app/build /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
