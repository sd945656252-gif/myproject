#!/bin/bash

# AI Creative Hub 一键部署脚本
# 使用方法: ./deploy.sh [production|development]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数: 打印信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 函数: 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 函数: 检查依赖
check_dependencies() {
    print_info "检查依赖..."

    if ! command_exists docker; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! command_exists docker-compose; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    print_info "依赖检查完成"
}

# 函数: 生成密钥
generate_secrets() {
    print_info "生成密钥和密码..."

    # 生成 SECRET_KEY
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    print_info "SECRET_KEY: $SECRET_KEY"

    # 生成数据库密码
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=')
    print_info "数据库密码: $DB_PASSWORD"

    # 生成 Redis 密码
    REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')
    print_info "Redis 密码: $REDIS_PASSWORD"

    # 保存到临时文件
    cat > .secrets.tmp <<EOF
SECRET_KEY=$SECRET_KEY
POSTGRES_USER=app_db_user
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=ai_creative_hub
REDIS_PASSWORD=$REDIS_PASSWORD
EOF

    print_warning "密钥已生成，请将这些值复制到 .docker.env 文件中"
    cat .secrets.tmp
    rm .secrets.tmp
}

# 函数: 配置环境变量
configure_env() {
    print_info "配置环境变量..."

    if [ ! -f .docker.env ]; then
        if [ -f .docker.env.example ]; then
            cp .docker.env.example .docker.env
            print_info "已创建 .docker.env 文件"
            print_warning "请编辑 .docker.env 文件，填入生成的密钥和配置"
        else
            print_error ".docker.env.example 文件不存在"
            exit 1
        fi
    else
        print_info ".docker.env 文件已存在，跳过创建"
    fi

    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_info "已创建 .env 文件"
            print_warning "请编辑 .env 文件，填入生成的密钥和配置"
        else
            print_error ".env.example 文件不存在"
            exit 1
        fi
    else
        print_info ".env 文件已存在，跳过创建"
    fi
}

# 函数: 停止旧服务
stop_services() {
    print_info "停止旧服务..."
    docker-compose down
}

# 函数: 构建镜像
build_images() {
    print_info "构建 Docker 镜像..."
    docker-compose build --no-cache
}

# 函数: 启动服务
start_services() {
    print_info "启动服务..."
    docker-compose up -d
}

# 函数: 初始化数据库
init_database() {
    print_info "初始化数据库..."
    sleep 10  # 等待数据库启动

    # 执行数据库迁移
    docker-compose exec backend alembic upgrade head

    print_info "数据库初始化完成"
}

# 函数: 健康检查
health_check() {
    print_info "执行健康检查..."

    # 等待服务启动
    sleep 5

    # 检查后端
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_info "✅ 后端服务正常"
    else
        print_error "❌ 后端服务异常"
        return 1
    fi

    # 检查前端
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_info "✅ 前端服务正常"
    else
        print_warning "⚠️  前端服务可能仍在启动中"
    fi

    # 检查数据库
    if docker-compose exec -T db pg_isready >/dev/null 2>&1; then
        print_info "✅ 数据库连接正常"
    else
        print_error "❌ 数据库连接异常"
        return 1
    fi

    # 检查 Redis
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_info "✅ Redis 连接正常"
    else
        print_warning "⚠️  Redis 可能需要密码认证"
    fi
}

# 函数: 显示服务状态
show_status() {
    print_info "服务状态："
    docker-compose ps
}

# 函数: 显示日志
show_logs() {
    print_info "最近的日志："
    docker-compose logs --tail=50
}

# 主函数
main() {
    local ENVIRONMENT=${1:-development}

    print_info "========================================"
    print_info "  AI Creative Hub 部署脚本"
    print_info "  环境: $ENVIRONMENT"
    print_info "========================================"

    # 检查依赖
    check_dependencies

    # 如果是首次部署，生成密钥
    if [ ! -f .docker.env ] || [ ! -f .env ]; then
        print_warning "检测到首次部署"
        generate_secrets
        configure_env
        print_warning "请先编辑 .docker.env 和 .env 文件，然后重新运行此脚本"
        exit 0
    fi

    # 生产环境确认
    if [ "$ENVIRONMENT" = "production" ]; then
        print_warning "生产环境部署确认"
        read -p "是否继续？(yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_info "部署已取消"
            exit 0
        fi
    fi

    # 停止旧服务
    stop_services

    # 构建镜像
    build_images

    # 启动服务
    start_services

    # 初始化数据库
    init_database

    # 健康检查
    health_check

    # 显示状态
    show_status

    # 显示访问信息
    echo ""
    print_info "========================================"
    print_info "  部署完成！"
    print_info "========================================"
    print_info "前端访问: http://localhost:3000"
    print_info "后端 API: http://localhost:8000"
    print_info "健康检查: http://localhost:8000/health"
    print_info ""
    print_info "查看日志: docker-compose logs -f"
    print_info "停止服务: docker-compose down"
    print_info "========================================"

    # 如果是生产环境，显示额外提示
    if [ "$ENVIRONMENT" = "production" ]; then
        print_warning "生产环境部署提醒："
        echo "  1. 配置反向代理（Nginx）"
        echo "  2. 获取 SSL/TLS 证书"
        echo "  3. 配置防火墙规则"
        echo "  4. 设置定期备份"
        echo "  5. 配置监控和告警"
    fi
}

# 运行主函数
main "$@"
