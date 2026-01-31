# NestJS Backend System

A robust, production-ready backend system built with NestJS, featuring PostgreSQL, Redis, RabbitMQ, Stripe payments, Resend email services, MongoDB for chat storage, and Elasticsearch for powerful search capabilities.

## 🚀 Features

- **NestJS Framework**: Modern Node.js framework with TypeScript support
- **PostgreSQL Database**: Reliable relational database with TypeORM
- **MongoDB**: NoSQL database for chat message storage
- **Elasticsearch**: Powerful search engine for chat history and user search
- **Redis Caching**: High-performance caching for improved response times
- **RabbitMQ Messaging**: Asynchronous message queuing system
- **Stripe Integration**: Secure payment processing
- **Resend Email Service**: Modern email delivery platform
- **JWT Authentication**: Secure user authentication and authorization
- **WebSockets**: Real-time chat functionality with Socket.IO
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Error Handling**: Global exception filters and logging
- **Request Validation**: DTO validation with class-validator
- **Health Checks**: Application health monitoring endpoints
- **Docker Support**: Containerized development and deployment
- **Testing**: Unit and integration tests with Jest

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL
- Redis
- RabbitMQ
- MongoDB
- Elasticsearch

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestjs-backend-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration.

   **Hotel research environment (alternative)**
   ```bash
   cp .env.hotel-research .env
   ```

   Or run with:
   ```bash
   NODE_ENV=hotel-research npm run start:dev
   ```

## 🐳 Docker Development

1. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f app
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## 📚 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 🗄️ Database

### Run Migrations
```bash
npm run migration:run
```

### Generate Migration
```bash
npm run migration:generate -- MigrationName
```

### Revert Migration
```bash
npm run migration:revert
```

## 📁 Project Structure

```
src/
├── common/                 # Shared utilities and decorators
│   ├── filters/           # Exception filters
│   └── interceptors/      # Request/response interceptors
├── config/                # Configuration files
├── database/              # Database configuration and migrations
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   ├── users/            # User management
│   ├── payments/         # Stripe payment integration
│   ├── emails/           # Resend email service
│   ├── queues/           # RabbitMQ message queues
│   ├── health/           # Health check endpoints
│   ├── chat/             # Real-time chat functionality
│   ├── elasticsearch/    # Elasticsearch integration
│   └── admin/            # Admin dashboard APIs
├── app.module.ts         # Root application module
└── main.ts              # Application entry point
```

## 🔐 Authentication

The system uses JWT-based authentication:

1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. **Protected Routes**: Include `Authorization: Bearer <token>` header

## 💬 Chat System

The chat system provides real-time communication capabilities:

1. **Create Room**: `POST /api/v1/chat/rooms`
2. **Get User Rooms**: `GET /api/v1/chat/rooms`
3. **Get Room Messages**: `GET /api/v1/chat/rooms/:roomId/messages`
4. **Send Message**: `POST /api/v1/chat/messages`
5. **Mark as Read**: `POST /api/v1/chat/rooms/:roomId/read`
6. **Search Messages**: `POST /api/v1/chat/search`

WebSocket events:
- `connection`: Connect to the WebSocket server
- `joinRoom`: Join a chat room
- `leaveRoom`: Leave a chat room
- `sendMessage`: Send a message to a room
- `typing`: Indicate user is typing
- `newMessage`: Receive new messages
- `userTyping`: Receive typing notifications
- `userStatus`: User online/offline status updates

## 🔍 Elasticsearch Integration

The system uses Elasticsearch for powerful search capabilities:

1. **Search Chat Messages**: `POST /api/v1/chat/search`
2. **Admin Search**: `POST /api/v1/admin/chat/search`
3. **User Search**: `GET /api/v1/admin/users/search`

## 💳 Payments

Stripe integration for payment processing:

1. **Create Payment Intent**: `POST /api/v1/payments/create-intent`
2. **Confirm Payment**: `POST /api/v1/payments/confirm/:paymentIntentId`
3. **Webhook Endpoint**: `POST /api/v1/payments/webhook`

## 📧 Email Service

Resend integration for email delivery:

- Welcome emails
- Password reset emails
- Payment confirmation emails
- Custom email sending

## 🔄 Message Queues

RabbitMQ integration for asynchronous processing:

- Email queue processing
- Background job execution
- Event-driven architecture

## 📊 Monitoring and Logging

- **Winston Logger**: Structured logging with file and console output
- **Health Checks**: Database, memory, and disk monitoring
- **Request Logging**: Automatic request/response logging
- **Error Tracking**: Global exception handling

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: DTO validation
- **Password Hashing**: bcrypt encryption

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Production
```bash
docker build -t nestjs-backend .
docker run -p 3000:3000 nestjs-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test files for usage examples

## 📝 Changelog

### v1.1.0
- Added real-time chat functionality with WebSockets
- Integrated MongoDB for chat message storage
- Added Elasticsearch for powerful search capabilities
- Created admin dashboard APIs for chat monitoring

### v1.0.0
- Initial release with full feature set
- NestJS framework setup
- Database integration with TypeORM
- Redis caching implementation
- RabbitMQ message queuing
- Stripe payment processing
- Resend email service
- JWT authentication
- Comprehensive API documentation
- Docker support
- Testing suite
