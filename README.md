# 🚗 Ride Booking API

A secure, scalable, and role-based backend API for a ride booking system (like Uber, Pathao) built with Express.js, TypeScript, MongoDB, and JWT authentication.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [Database Models](#-database-models)
- [Usage Examples](#-usage-examples)
- [Testing](#-testing)
- [Contributing](#-contributing)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Three distinct roles: **Admin**, **Rider**, **Driver**
- Secure password hashing with bcrypt
- Role-based route protection

### 🧍 User Management
- User registration and login
- Profile management and updates
- Account deactivation
- Password change functionality

### 🚘 Driver Features
- Driver registration with vehicle information
- Admin approval workflow for new drivers
- Online/offline status management
- Earnings tracking and statistics
- Ride acceptance and status updates
- Vehicle information management

### 🙋 Rider Features
- Ride request with pickup and destination
- Ride cancellation (within allowed window)
- Ride history with pagination
- Real-time ride status tracking

### 👑 Admin Features
- User management (view, block/unblock)
- Driver approval/rejection
- System-wide ride monitoring
- Comprehensive analytics and reports
- System statistics dashboard

### 🚗 Ride Management
- Complete ride lifecycle management
- Status tracking: `requested` → `accepted` → `picked_up` → `in_transit` → `completed`
- Automatic fare calculation
- Ride history with detailed information
- Cancellation handling with reasons

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Language** | TypeScript |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (jsonwebtoken) |
| **Security** | bcryptjs, helmet, cors |
| **Validation** | Zod |
| **Rate Limiting** | express-rate-limit |
| **Logging** | morgan |
| **Development** | nodemon, ts-node |

## 📁 Project Structure

```
src/
├── modules/
│   ├── auth/                 # Authentication module
│   │   ├── auth.controller.ts
│   │   └── auth.routes.ts
│   ├── user/                 # User management
│   │   ├── user.model.ts
│   │   ├── user.controller.ts
│   │   └── user.routes.ts
│   ├── driver/               # Driver-specific features
│   │   ├── driver.controller.ts
│   │   └── driver.routes.ts
│   ├── ride/                 # Ride management
│   │   ├── ride.model.ts
│   │   ├── ride.controller.ts
│   │   └── ride.routes.ts
│   └── admin/                # Admin features
│       ├── admin.controller.ts
│       └── admin.routes.ts
├── middlewares/              # Custom middleware
│   ├── auth.ts              # Authentication & authorization
│   ├── validation.ts        # Input validation
│   └── error.ts             # Error handling
├── config/                   # Configuration files
│   ├── index.ts             # Main config
│   └── database.ts          # Database connection
├── utils/                    # Utility functions
│   ├── response.ts          # Standardized API responses
│   ├── jwt.ts               # JWT utilities
│   ├── password.ts          # Password hashing
│   └── validation.ts        # Zod schemas
├── app.ts                    # Express app setup
└── server.ts                # Server entry point
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ride-booking-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **For production**
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ride-booking-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📚 API Endpoints

### 🔐 Authentication Routes
```
POST   /api/auth/register          # Register new user
POST   /api/auth/register/driver   # Register new driver
POST   /api/auth/login             # User login
GET    /api/auth/profile           # Get user profile
```

### 👤 User Routes
```
PATCH  /api/users/profile          # Update profile
PATCH  /api/users/change-password  # Change password
PATCH  /api/users/deactivate       # Deactivate account
```

### 🚗 Ride Routes
```
POST   /api/rides/request          # Request a ride (Rider)
PATCH  /api/rides/:id/cancel       # Cancel ride (Rider)
GET    /api/rides/history          # Get ride history (Rider)

GET    /api/rides/available        # Get available rides (Driver)
PATCH  /api/rides/:id/accept       # Accept ride (Driver)
PATCH  /api/rides/:id/status       # Update ride status (Driver)
GET    /api/rides/earnings         # Get earnings (Driver)
PATCH  /api/rides/status           # Set online/offline (Driver)
```

### 🚙 Driver Routes
```
GET    /api/drivers/stats          # Get driver statistics
PATCH  /api/drivers/vehicle        # Update vehicle info
GET    /api/drivers/active-ride    # Get current active ride
GET    /api/drivers/ride-history   # Get ride history
```

### 👑 Admin Routes
```
GET    /api/admin/users            # Get all users
GET    /api/admin/users/:id        # Get user by ID
GET    /api/admin/drivers/pending  # Get pending drivers
PATCH  /api/admin/drivers/:id/approve # Approve/reject driver
PATCH  /api/admin/users/:id/block  # Block/unblock user
GET    /api/admin/rides            # Get all rides
GET    /api/admin/rides/:id        # Get ride by ID
GET    /api/admin/stats            # Get system statistics
```

## 🔒 Authentication & Authorization

### JWT Authentication
- Include JWT token in request headers: `Authorization: Bearer <token>`
- Tokens expire based on `JWT_EXPIRES_IN` configuration
- Automatic token validation on protected routes

### Role-Based Access Control
- **Admin**: Full system access, user management, driver approval
- **Rider**: Ride requests, cancellation, history viewing
- **Driver**: Ride acceptance, status updates, earnings (requires approval)

### Protected Route Examples
```typescript
// Rider only
router.post('/request', authenticate, authorize('rider'), requestRide);

// Driver only (with approval check)
router.get('/available', authenticate, authorize('driver'), checkDriverApproval, getAvailableRides);

// Admin only
router.get('/users', authenticate, authorize('admin'), getAllUsers);
```

## 🗄️ Database Models

### User Model
```typescript
interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'rider' | 'driver';
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
}
```

### Driver Model (extends User)
```typescript
interface IDriver extends IUser {
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
  };
  licenseNumber: string;
  isApproved: boolean;
  isOnline: boolean;
  rating: number;
  totalRides: number;
  totalEarnings: number;
}
```

### Ride Model
```typescript
interface IRide {
  riderId: string;
  driverId?: string;
  pickupLocation: ILocation;
  destinationLocation: ILocation;
  rideType: 'standard' | 'premium' | 'shared';
  status: 'requested' | 'accepted' | 'picked_up' | 'in_transit' | 'completed' | 'cancelled';
  estimatedFare?: number;
  actualFare?: number;
  // ... timestamps and other fields
}
```

## 💡 Usage Examples

### Register a New Rider
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "password": "SecurePass123",
    "phone": "+1234567890",
    "role": "rider"
  }'
```

### Request a Ride
```bash
curl -X POST http://localhost:3000/api/rides/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "pickupLocation": {
      "address": "123 Main St, City",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    },
    "destinationLocation": {
      "address": "456 Oak Ave, City", 
      "coordinates": {
        "latitude": 40.7589,
        "longitude": -73.9851
      }
    },
    "rideType": "standard"
  }'
```

### Accept a Ride (Driver)
```bash
curl -X PATCH http://localhost:3000/api/rides/:rideId/accept \
  -H "Authorization: Bearer <driver-token>"
```

## 🧪 Testing

The API can be tested using:

### Postman Collection
1. Import the API endpoints into Postman
2. Set up environment variables for base URL and tokens
3. Test authentication flow: Register → Login → Protected routes

### Manual Testing Flow
1. **Setup**: Start MongoDB and the API server
2. **Register Users**: Create admin, rider, and driver accounts
3. **Admin Actions**: Approve driver accounts
4. **Ride Flow**: Request ride (rider) → Accept ride (driver) → Update status → Complete

### Health Check
```bash
curl http://localhost:3000/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

