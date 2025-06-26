# Barbershop Booking API

A modern REST API for a barbershop booking marketplace built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - HTTP-only cookies for refresh tokens
  - Role-based access control (RBAC)
  - Support for superadmin, admin, barber, and client roles

- **Barbershop Management**
  - CRUD operations for barbershops
  - Multi-admin support per barbershop
  - Working hours management
  - Location-based services

- **Barber Management**
  - Barber profiles with specialties
  - Service assignments
  - Working hours and availability

- **Service Management**
  - Service catalog with pricing
  - Duration-based scheduling
  - Category organization

- **Booking System**
  - Real-time slot availability
  - Multi-service bookings
  - Booking confirmation and cancellation
  - Calendar integration

- **Security & Performance**
  - Rate limiting
  - Input validation with Zod
  - Error handling middleware
  - CORS configuration
  - Helmet security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
src/
├── config/          # Environment configuration
├── controllers/     # Route handlers
├── middlewares/     # Express middlewares
├── prisma/         # Database schema and client
├── routes/         # Express routes
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── index.ts        # Server entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm or npm

### Installation

1. **Clone and install dependencies**
   ```bash
   cd backend
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/barbershop_db"
   JWT_ACCESS_SECRET="your-super-secret-access-key-here"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
   COOKIE_SECRET="your-cookie-secret-here"
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN="http://localhost:3000"
   ```

3. **Set up database**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   
   # Seed database with sample data
   pnpm db:seed
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3001`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | User logout | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Barbershops

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/barbershops` | List barbershops | No |
| GET | `/api/barbershops/:id` | Get barbershop details | No |
| POST | `/api/barbershops` | Create barbershop | Admin+ |
| PUT | `/api/barbershops/:id` | Update barbershop | Admin+ |
| DELETE | `/api/barbershops/:id` | Delete barbershop | Admin+ |
| GET | `/api/barbershops/:id/admins` | Get barbershop admins | Yes |

### Bookings

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings` | Create booking | Yes |
| GET | `/api/bookings` | List bookings | Yes |
| GET | `/api/bookings/:id` | Get booking details | Yes |
| PUT | `/api/bookings/:id` | Update booking | Yes |
| DELETE | `/api/bookings/:id` | Cancel booking | Yes |
| GET | `/api/bookings/calendar` | Get calendar slots | Yes |

## 🔐 Authentication

The API uses JWT tokens for authentication:

- **Access Token**: Short-lived (15 minutes), sent in Authorization header
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie

### Example Usage

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "client@example.com", "password": "client123"}'

# Use access token
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 👥 User Roles

### Super Admin
- Full system access
- Can manage all barbershops and users
- Can create admin users

### Admin (Barbershop Manager)
- Manage their barbershop
- Create and manage barbers
- View and manage bookings
- Manage services

### Barber
- View their schedule
- Manage their availability
- View their bookings
- Update booking status

### Client
- Browse barbershops
- Book appointments
- View booking history
- Cancel bookings

## 🗄️ Database Schema

The database includes the following main entities:

- **Users**: Authentication and role management
- **Barbershops**: Business information and settings
- **Barbers**: Staff profiles and specialties
- **Services**: Service catalog with pricing
- **Slots**: Time availability management
- **Bookings**: Appointment records
- **BookingServices**: Many-to-many relationship for services in bookings

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm type-check       # TypeScript type checking
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_ACCESS_SECRET` | JWT access token secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `COOKIE_SECRET` | Cookie signing secret | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🧪 Testing

The API includes comprehensive error handling and validation:

- Input validation with Zod schemas
- Role-based access control
- Proper HTTP status codes
- Detailed error messages
- Rate limiting protection

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Setup

For production deployment:

1. Set `NODE_ENV=production`
2. Use strong, unique secrets for JWT and cookies
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Configure database connection pooling
6. Set up monitoring and logging

### Docker (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the API documentation
2. Review the error messages
3. Check the server logs
4. Open an issue on GitHub

## 🔄 Sample Data

After running the seed script, you'll have access to:

- **Super Admin**: `superadmin@barbershop.com` / `superadmin123`
- **Admin**: `admin@barbershop.com` / `admin123`
- **Barber 1**: `john@elitebarbershop.com` / `barber123`
- **Barber 2**: `mike@elitebarbershop.com` / `barber123`
- **Client**: `client@example.com` / `client123`

The seed data includes a sample barbershop with services, barbers, and time slots for testing the booking system. 