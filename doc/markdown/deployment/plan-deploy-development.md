# Kế hoạch tạo Script triển khai môi trường phát triển

**Người thực hiện:** Roo (AI Architect)
**Ngày thực hiện:** 03-08-2025
**Người giám sát:** default_user

## Tóm tắt kế hoạch:
Kế hoạch này phác thảo các bước để tạo một script triển khai tự động cho môi trường phát triển của ứng dụng TheShoeBolt. Script sẽ tập trung vào việc thiết lập nhanh chóng môi trường, bao gồm kiểm tra công cụ, xây dựng và khởi động các dịch vụ Docker, và tùy chọn cấu hình cơ sở dữ liệu.

## Nội dung kế hoạch:

### Bước 1: Xác định các vấn đề và chia thành các phase

**Vấn đề:** Tạo một script Bash để tự động hóa quá trình triển khai ứng dụng TheShoeBolt trong môi trường phát triển.

**Các Phase:**

*   **Phase 1: Khởi tạo và Cấu hình cơ bản**
    *   Mục tiêu: Đảm bảo môi trường phát triển có đủ các công cụ cần thiết và các biến môi trường được thiết lập đúng.
*   **Phase 2: Xây dựng và Khởi động dịch vụ**
    *   Mục tiêu: Build các Docker image và khởi động tất cả các dịch vụ cần thiết cho ứng dụng.
*   **Phase 3: Cấu hình cơ sở dữ liệu (tùy chọn)**
    *   Mục tiêu: Chạy các migration cơ sở dữ liệu và seed dữ liệu ban đầu nếu cần.
*   **Phase 4: Kiểm tra đơn giản**
    *   Mục tiêu: Thực hiện kiểm tra cơ bản để xác nhận ứng dụng đã khởi động thành công.

### Bước 2: Phân tích chi tiết và triển khai các bước

#### Phase 1: Khởi tạo và Cấu hình cơ bản

*   **Mục tiêu:** Đảm bảo các công cụ cần thiết (Docker, Docker Compose) có sẵn và các biến môi trường được thiết lập.
*   **Chi tiết triển khai:**
    *   Sử dụng `set -e` để thoát nếu có lỗi.
    *   Định nghĩa các hàm `log`, `error`, `success`, `warning` tương tự như script sản xuất để có đầu ra nhất quán.
    *   Kiểm tra sự tồn tại của file `.env.development` (hoặc `.env` nếu đó là file cấu hình mặc định cho dev).
    *   Kiểm tra Docker và Docker Compose đã được cài đặt và đang chạy.

    ```bash
    #!/bin/bash
    set -e

    # Colors for output
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color

    # Functions
    log() {
        echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    }

    error() {
        echo -e "${RED}[ERROR]${NC} $1"
        exit 1
    }

    success() {
        echo -e "${GREEN}[SUCCESS]${NC} $1"
    }

    # Pre-deployment checks for development
    pre_deployment_checks_dev() {
        log "Starting pre-deployment checks for development..."

        if [ ! -f ".env.development" ]; then
            error ".env.development file not found. Please create it from .env.example"
        fi

        if ! docker info > /dev/null 2>&1; then
            error "Docker is not running. Please start Docker first."
        fi

        if ! command -v docker-compose &> /dev/null; then
            error "docker-compose is not installed. Please install it first."
        fi

        success "Pre-deployment checks completed for development."
    }
    ```

#### Phase 2: Xây dựng và Khởi động dịch vụ

*   **Mục tiêu:** Build Docker images và khởi động các container.
*   **Chi tiết triển khai:**
    *   Sử dụng `docker-compose.yml` (hoặc `docker-compose.dev.yml` nếu có file riêng cho dev).
    *   Build lại các image để đảm bảo code mới nhất được đưa vào.
    *   Dừng các dịch vụ hiện có (nếu có) và khởi động lại trong chế độ detached.

    ```bash
    # Build and deploy for development
    deploy_application_dev() {
        log "Building and deploying application for development..."

        log "Building application images..."
        docker-compose -f docker-compose.yml build --no-cache # Assuming docker-compose.yml is for dev

        log "Stopping existing services (if any)..."
        docker-compose -f docker-compose.yml down

        log "Starting services..."
        docker-compose -f docker-compose.yml up -d

        success "Application deployed successfully for development."
    }
    ```

#### Phase 3: Cấu hình cơ sở dữ liệu (tùy chọn)

*   **Mục tiêu:** Chạy migration và seed dữ liệu.
*   **Chi tiết triển khai:**
    *   Đây là bước tùy chọn, có thể cần chạy các lệnh migration của ORM (ví dụ: Prisma, TypeORM) hoặc seed dữ liệu mẫu.
    *   Cần xác định cách truy cập vào container ứng dụng hoặc database để chạy các lệnh này.

    ```bash
    # Database setup for development (optional)
    setup_database_dev() {
        log "Setting up database for development (migrations and seeding)..."

        # Example for NestJS/TypeORM migrations (adjust based on actual project setup)
        # docker-compose exec app npm run typeorm migration:run

        # Example for seeding data (adjust based on actual project setup)
        # docker-compose exec app npm run seed

        success "Database setup completed for development."
    }
    ```

#### Phase 4: Kiểm tra đơn giản

*   **Mục tiêu:** Kiểm tra ứng dụng có chạy hay không.
*   **Chi tiết triển khai:**
    *   Chờ một khoảng thời gian ngắn để dịch vụ khởi động.
    *   Thực hiện một `curl` đơn giản đến một endpoint cơ bản (ví dụ: `/health` hoặc `/`).

    ```bash
    # Simple health check for development
    health_check_dev() {
        log "Performing simple health check for development..."

        sleep 10 # Give services some time to start

        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            success "Application is running and accessible."
        else
            error "Application did not respond to health check."
        fi
    }
    ```

**Cấu trúc script hoàn chỉnh dự kiến:**

```bash
#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Pre-deployment checks for development
pre_deployment_checks_dev() {
    log "Starting pre-deployment checks for development..."

    if [ ! -f ".env.development" ]; then
        error ".env.development file not found. Please create it from .env.example"
    fi

    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
    fi

    if ! command -v docker-compose &> /dev/null; then
        error "docker-compose is not installed. Please install it first."
    fi

    success "Pre-deployment checks completed for development."
}

# Build and deploy for development
deploy_application_dev() {
    log "Building and deploying application for development..."

    log "Building application images..."
    docker-compose -f docker-compose.yml build --no-cache

    log "Stopping existing services (if any)..."
    docker-compose -f docker-compose.yml down

    log "Starting services..."
    docker-compose -f docker-compose.yml up -d

    success "Application deployed successfully for development."
}

# Database setup for development (optional)
setup_database_dev() {
    log "Setting up database for development (migrations and seeding)..."

    # Example for NestJS/TypeORM migrations (adjust based on actual project setup)
    # docker-compose exec app npm run typeorm migration:run

    # Example for seeding data (adjust based on actual project setup)
    # docker-compose exec app npm run seed

    success "Database setup completed for development."
}

# Simple health check for development
health_check_dev() {
    log "Performing simple health check for development..."

    sleep 10 # Give services some time to start

    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Application is running and accessible."
    else
        error "Application did not respond to health check."
    fi
}

# Main development deployment process
main_dev() {
    log "Starting development deployment for TheShoeBolt"

    pre_deployment_checks_dev
    deploy_application_dev
    setup_database_dev # Optional: Uncomment if you need database setup
    health_check_dev

    success "Development deployment completed successfully!"
    log "Application should be accessible at: http://localhost:3000"
}

# Script execution
main_dev
```

### Bước 3: Tiến hành kiểm thử các triển khai vừa thực hiện.

*   **Loại kiểm thử:**
    *   **Kiểm thử thủ công (Manual Test)**: Chạy script và quan sát đầu ra trên terminal. Kiểm tra xem các container Docker có được khởi động đúng cách không (`docker ps`), và ứng dụng có thể truy cập được qua trình duyệt hay không.
    *   **Kiểm thử tích hợp (Integration Test)**: Nếu có các bài test tích hợp sẵn trong dự án (ví dụ: chạy `npm run test:e2e` hoặc `npm run test:component`), có thể thêm lệnh này vào cuối script hoặc chạy riêng sau khi script triển khai hoàn tất.

*   **Câu hỏi cho người dùng:**
    Bạn muốn thực hiện các bài test nào sau khi script triển khai môi trường phát triển được tạo?
    *   Chỉ kiểm thử thủ công (chạy script và kiểm tra bằng tay).
    *   Thêm lệnh chạy các bài test tích hợp/E2E tự động vào cuối script.
    *   Cả hai.