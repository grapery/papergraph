# 1. 构建前端（VUE）
FROM node:20 AS frontend-build
WORKDIR /app/vue-frontend
COPY vue-frontend/package*.json ./
RUN npm install
COPY vue-frontend/ ./
RUN npm run build

# 2. 构建后端（Go）
FROM golang:1.22 AS backend-build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# 将前端构建产物拷贝到后端静态目录
COPY --from=frontend-build /app/vue-frontend/dist/* /app/static/
RUN CGO_ENABLED=0 GOOS=linux go build -o server main.go

# 3. 生产环境镜像
FROM alpine:3.19
WORKDIR /app
COPY --from=backend-build /app/server .
COPY --from=backend-build /app/static ./app/static
COPY .env .env
# 如有其他配置文件，可在此处继续COPY

EXPOSE 8080

CMD ["./server"] 