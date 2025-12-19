# Ride Booking API

A secure, scalable, and role-based backend API for a ride booking system (Uber/Pathao style) built with Express.js, TypeScript, and Mongoose.

## Features
- JWT authentication (admin, rider, driver)
- Secure password hashing (bcrypt)
- Rider: request/cancel rides, view history, rate rides
- Driver: accept/reject rides, update status, view earnings, set availability
- Admin: manage users/drivers/rides, approve/suspend/block, dashboard stats
- Modular code architecture
- Role-based route protection
- Complete ride history
- RESTful API endpoints
- Geo-based driver matching
- Fare calculation based on distance

## Project Structure
```
src/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── driver/
│   ├── ride/
│   ├── admin/
├── middlewares/
├── config/
├── utils/
├── app.ts
```

## Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ARNOB663/B5A5.git
   cd B5A5
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ride-booking
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CORS_ORIGIN=http://localhost:3000
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   # Production
   npm start
   
   # Development (with auto-reload)
   npm run dev
   ```

6. Verify the server is running:
   - Visit `http://localhost:3000` or `http://localhost:3000/health`
   - You should see a success response

## API Testing Guide

### Base URL
```
http://localhost:3000/api/v1
```

### Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... }
}
```

### Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
**Endpoint:** `POST /api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "rider"
}
```

**Role Options:** `rider`, `driver`, or `admin`

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "rider",
      "isBlocked": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Testing Steps:**
1. Create accounts for different roles:
   - Register as `rider`
   - Register as `driver`
   - Register as `admin`

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "rider"
  }'
```

---

### 1.2 Login
**Endpoint:** `POST /api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "rider",
      "isBlocked": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Testing Steps:**
1. Login with registered credentials
2. Save the `token` from response for subsequent requests
3. Test with invalid credentials (should return 401)

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### 1.3 Get Profile
**Endpoint:** `GET /api/v1/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "driver",
      "isBlocked": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "driverDetails": {
        "_id": "...",
        "licenseNumber": "DL123456",
        "vehicleInfo": { ... },
        "approvalStatus": "pending",
        "status": "offline"
      }
    }
  }
}
```

**Testing Steps:**
1. Login first to get token
2. Use token in Authorization header
3. Verify user data is returned correctly

---

### 1.4 Register as Driver
**Endpoint:** `POST /api/v1/auth/driver/register`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Note:** User must be registered with `role: "driver"` first

**Request Body:**
```json
{
  "licenseNumber": "DL123456",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "plateNumber": "ABC-1234",
    "color": "Black"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Driver registration submitted for approval",
  "data": {
    "driver": {
      "_id": "...",
      "userId": "...",
      "licenseNumber": "DL123456",
      "vehicleInfo": {
        "make": "Toyota",
        "model": "Corolla",
        "year": 2020,
        "plateNumber": "ABC-1234",
        "color": "Black"
      },
      "approvalStatus": "pending",
      "status": "offline",
      "rating": 5.0,
      "totalRides": 0,
      "totalEarnings": 0
    }
  }
}
```

**Testing Steps:**
1. Register a user with `role: "driver"`
2. Login to get token
3. Submit driver registration
4. Note: Driver will be in `pending` status until admin approves

---

## 2. Rider Endpoints

### 2.1 Request Ride
**Endpoint:** `POST /api/v1/rides/request`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <rider-token>
```

**Request Body:**
```json
{
  "pickupLocation": {
    "address": "123 Main Street, City",
    "latitude": 23.8103,
    "longitude": 90.4125
  },
  "destination": {
    "address": "456 Park Avenue, City",
    "latitude": 23.7806,
    "longitude": 90.2792
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Ride requested successfully",
  "data": {
    "ride": {
      "_id": "...",
      "riderId": { "name": "John Doe", "phone": "+1234567890" },
      "pickupLocation": { ... },
      "destination": { ... },
      "status": "requested",
      "distance": 5.2,
      "fare": 128,
      "requestedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Testing Steps:**
1. Login as rider
2. Request a ride with valid coordinates
3. Verify fare is calculated automatically
4. Try requesting another ride while one is active (should fail)

---

### 2.2 Get Ride History
**Endpoint:** `GET /api/v1/rides/me` or `GET /api/v1/rides/history`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`requested`, `accepted`, `picked_up`, `in_transit`, `completed`, `cancelled`)

**Example:**
```
GET /api/v1/rides/me?page=1&limit=10&status=completed
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ride history retrieved successfully",
  "data": {
    "rides": [ ... ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRides": 50
    }
  }
}
```

**Testing Steps:**
1. Request several rides
2. Get ride history
3. Test pagination
4. Filter by status

---

### 2.3 Get Current Ride
**Endpoint:** `GET /api/v1/rides/current`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Current ride retrieved successfully",
  "data": {
    "ride": {
      "_id": "...",
      "status": "accepted",
      ...
    }
  }
}
```

**Response (404) if no active ride:**
```json
{
  "success": false,
  "message": "No active ride found"
}
```

---

### 2.4 Cancel Ride
**Endpoint:** `PATCH /api/v1/rides/:rideId/cancel`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

**Note:** `reason` is optional

**Response (200):**
```json
{
  "success": true,
  "message": "Ride cancelled successfully",
  "data": {
    "ride": { ... }
  }
}
```

**Testing Steps:**
1. Request a ride
2. Cancel it before driver accepts
3. Try cancelling after driver accepts (should work)
4. Try cancelling after pickup (should fail)

---

### 2.5 Rate Ride
**Endpoint:** `POST /api/v1/rides/:rideId/rate`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <rider-token>
```

**Request Body:**
```json
{
  "rating": 5,
  "feedback": "Great driver, very professional!"
}
```

**Note:** `feedback` is optional, `rating` must be 1-5

**Response (200):**
```json
{
  "success": true,
  "message": "Ride rated successfully",
  "data": {
    "ride": { ... }
  }
}
```

**Testing Steps:**
1. Complete a ride
2. Rate the ride
3. Try rating again (should fail - already rated)
4. Verify driver's average rating is updated

---

## 3. Driver Endpoints

### 3.1 Set Availability
**Endpoint:** `PATCH /api/v1/drivers/availability`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <driver-token>
```

**Request Body:**
```json
{
  "status": "online",
  "location": {
    "latitude": 23.8103,
    "longitude": 90.4125
  }
}
```

**Status Options:** `online`, `offline`, `busy`

**Note:** `location` is required when `status` is `online`

**Response (200):**
```json
{
  "success": true,
  "message": "Availability status updated successfully",
  "data": {
    "driver": { ... }
  }
}
```

**Testing Steps:**
1. Login as driver (must be approved by admin)
2. Set status to online with location
3. Set status to offline
4. Try setting online without location (should fail)

---

### 3.2 Update Location
**Endpoint:** `PATCH /api/v1/drivers/location`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <driver-token>
```

**Request Body:**
```json
{
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "location": {
      "latitude": 23.8103,
      "longitude": 90.4125
    }
  }
}
```

---

### 3.3 Get Available Rides
**Endpoint:** `GET /api/v1/rides/available`

**Headers:**
```
Authorization: Bearer <driver-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Available rides retrieved successfully",
  "data": {
    "rides": [
      {
        "_id": "...",
        "riderId": { "name": "John Doe", "phone": "+1234567890" },
        "pickupLocation": { ... },
        "destination": { ... },
        "distance": 5.2,
        "fare": 128,
        "distanceFromDriver": 2.5
      }
    ]
  }
}
```

**Note:** Rides are sorted by distance from driver's location (if available)

**Testing Steps:**
1. Driver must be online and approved
2. Request a ride as rider
3. Driver views available rides
4. Verify rides are sorted by distance

---

### 3.4 Accept Ride
**Endpoint:** `POST /api/v1/rides/:rideId/accept`

**Headers:**
```
Authorization: Bearer <driver-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Ride accepted successfully",
  "data": {
    "ride": { ... }
  }
}
```

**Testing Steps:**
1. Driver must be online and approved
2. Get available rides
3. Accept a ride
4. Try accepting another ride while one is active (should fail)

---

### 3.5 Update Ride Status
**Endpoint:** `PATCH /api/v1/rides/:rideId/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <driver-token>
```

**Request Body:**
```json
{
  "status": "picked_up"
}
```

**Status Flow:** `accepted` → `picked_up` → `in_transit` → `completed`

**Response (200):**
```json
{
  "success": true,
  "message": "Ride status updated successfully",
  "data": {
    "ride": { ... }
  }
}
```

**Testing Steps:**
1. Accept a ride
2. Update status to `picked_up`
3. Update status to `in_transit`
4. Update status to `completed`
5. Verify driver earnings are updated
6. Try invalid status transitions (should fail)

---

### 3.6 Get Earnings
**Endpoint:** `GET /api/v1/drivers/earnings`

**Headers:**
```
Authorization: Bearer <driver-token>
```

**Query Parameters:**
- `startDate` (optional): Start date filter (ISO format)
- `endDate` (optional): End date filter (ISO format)

**Example:**
```
GET /api/v1/drivers/earnings?startDate=2024-01-01&endDate=2024-01-31
```

**Response (200):**
```json
{
  "success": true,
  "message": "Earnings retrieved successfully",
  "data": {
    "totalEarnings": 5000,
    "periodEarnings": 1500,
    "totalRides": 50,
    "periodRides": 15,
    "rides": [ ... ]
  }
}
```

**Testing Steps:**
1. Complete several rides
2. Get earnings
3. Test date filtering
4. Verify calculations are correct

---

## 4. Admin Endpoints

### 4.1 Get Admin Endpoints Info
**Endpoint:** `GET /api/v1/admin`

**Headers:** None required

**Response (200):**
```json
{
  "success": true,
  "message": "Admin API endpoints",
  "endpoints": {
    "users": { ... },
    "drivers": { ... },
    "rides": { ... },
    "dashboard": { ... }
  },
  "note": "All endpoints require authentication with admin role"
}
```

---

### 4.2 Get All Users
**Endpoint:** `GET /api/v1/admin/users`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (`rider`, `driver`, `admin`)
- `search` (optional): Search by name, email, or phone

**Example:**
```
GET /api/v1/admin/users?page=1&limit=20&role=rider&search=john
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [ ... ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50
    }
  }
}
```

---

### 4.3 Block User
**Endpoint:** `PATCH /api/v1/admin/users/:userId/block`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "user": { ... }
  }
}
```

**Note:** If user is a driver, they will also be suspended

---

### 4.4 Unblock User
**Endpoint:** `PATCH /api/v1/admin/users/:userId/unblock`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User unblocked successfully",
  "data": {
    "user": { ... }
  }
}
```

---

### 4.5 Get All Drivers
**Endpoint:** `GET /api/v1/admin/drivers`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`online`, `offline`, `busy`)
- `approvalStatus` (optional): Filter by approval (`pending`, `approved`, `suspended`)

**Example:**
```
GET /api/v1/admin/drivers?approvalStatus=pending
```

**Response (200):**
```json
{
  "success": true,
  "message": "Drivers retrieved successfully",
  "data": {
    "drivers": [ ... ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalDrivers": 25
    }
  }
}
```

---

### 4.6 Approve Driver
**Endpoint:** `PATCH /api/v1/admin/drivers/:driverId/approve`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Driver approved successfully",
  "data": {
    "driver": { ... }
  }
}
```

**Testing Steps:**
1. Register a driver
2. Login as admin
3. Get pending drivers
4. Approve a driver
5. Driver can now go online and accept rides

---

### 4.7 Suspend Driver
**Endpoint:** `PATCH /api/v1/admin/drivers/:driverId/suspend`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Driver suspended successfully",
  "data": {
    "driver": { ... }
  }
}
```

**Note:** Suspended drivers cannot go online or accept rides

---

### 4.8 Get All Rides
**Endpoint:** `GET /api/v1/admin/rides`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `startDate` (optional): Start date filter (ISO format)
- `endDate` (optional): End date filter (ISO format)

**Example:**
```
GET /api/v1/admin/rides?status=completed&startDate=2024-01-01
```

**Response (200):**
```json
{
  "success": true,
  "message": "Rides retrieved successfully",
  "data": {
    "rides": [ ... ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalRides": 100
    }
  }
}
```

---

### 4.9 Get Dashboard Stats
**Endpoint:** `GET /api/v1/admin/dashboard/stats`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "stats": {
      "totalUsers": 150,
      "totalDrivers": 25,
      "totalRides": 500,
      "completedRides": 450,
      "activeRides": 5,
      "totalRevenue": 50000,
      "pendingDriverApprovals": 3,
      "averageRidesPerDay": 15,
      "rideCompletionRate": 90
    }
  }
}
```

---

## 5. General Endpoints

### 5.1 Welcome Page
**Endpoint:** `GET /`

**Response (200):**
```json
{
  "success": true,
  "message": "Welcome to our Ride Sharing App! 🚗",
  "description": "A secure, scalable, and role-based backend API for ride booking",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/v1/auth",
    "rides": "/api/v1/rides",
    "drivers": "/api/v1/drivers",
    "admin": "/api/v1/admin"
  },
  "documentation": "See README.md for complete API documentation",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 5.2 Health Check
**Endpoint:** `GET /health`

**Response (200):**
```json
{
  "success": true,
  "message": "Ride Booking API is running!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Complete Testing Workflow

### Step 1: Setup
1. Start MongoDB
2. Start the server
3. Verify health endpoint works

### Step 2: Create Test Users
1. Register as **Admin**:
   ```json
   POST /api/v1/auth/register
   {
     "name": "Admin User",
     "email": "admin@test.com",
     "password": "admin123",
     "phone": "+1234567890",
     "role": "admin"
   }
   ```

2. Register as **Rider**:
   ```json
   POST /api/v1/auth/register
   {
     "name": "Rider User",
     "email": "rider@test.com",
     "password": "rider123",
     "phone": "+1234567891",
     "role": "rider"
   }
   ```

3. Register as **Driver**:
   ```json
   POST /api/v1/auth/register
   {
     "name": "Driver User",
     "email": "driver@test.com",
     "password": "driver123",
     "phone": "+1234567892",
     "role": "driver"
   }
   ```

### Step 3: Login and Get Tokens
1. Login as each user and save tokens

### Step 4: Complete Driver Registration
1. Login as driver
2. Register driver profile:
   ```json
   POST /api/v1/auth/driver/register
   {
     "licenseNumber": "DL123456",
     "vehicleInfo": {
       "make": "Toyota",
       "model": "Corolla",
       "year": 2020,
       "plateNumber": "ABC-1234",
       "color": "Black"
     }
   }
   ```

### Step 5: Admin Approves Driver
1. Login as admin
2. Get all drivers: `GET /api/v1/admin/drivers?approvalStatus=pending`
3. Approve driver: `PATCH /api/v1/admin/drivers/:driverId/approve`

### Step 6: Driver Goes Online
1. Login as driver
2. Set availability:
   ```json
   PATCH /api/v1/drivers/availability
   {
     "status": "online",
     "location": {
       "latitude": 23.8103,
       "longitude": 90.4125
     }
   }
   ```

### Step 7: Rider Requests Ride
1. Login as rider
2. Request ride:
   ```json
   POST /api/v1/rides/request
   {
     "pickupLocation": {
       "address": "123 Main St",
       "latitude": 23.8103,
       "longitude": 90.4125
     },
     "destination": {
       "address": "456 Park Ave",
       "latitude": 23.7806,
       "longitude": 90.2792
     }
   }
   ```

### Step 8: Driver Accepts Ride
1. Login as driver
2. Get available rides: `GET /api/v1/rides/available`
3. Accept ride: `POST /api/v1/rides/:rideId/accept`

### Step 9: Driver Updates Ride Status
1. Update to picked_up: `PATCH /api/v1/rides/:rideId/status` with `{"status": "picked_up"}`
2. Update to in_transit: `PATCH /api/v1/rides/:rideId/status` with `{"status": "in_transit"}`
3. Update to completed: `PATCH /api/v1/rides/:rideId/status` with `{"status": "completed"}`

### Step 10: Rider Rates Ride
1. Login as rider
2. Rate ride:
   ```json
   POST /api/v1/rides/:rideId/rate
   {
     "rating": 5,
     "feedback": "Great service!"
   }
   ```

### Step 11: Check Earnings
1. Login as driver
2. Get earnings: `GET /api/v1/drivers/earnings`

### Step 12: Admin Views Dashboard
1. Login as admin
2. Get stats: `GET /api/v1/admin/dashboard/stats`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route /api/v1/invalid not found"
}
```

---

## Testing Tips

1. **Always save tokens** after login for subsequent requests
2. **Test error cases**: invalid tokens, wrong roles, missing fields
3. **Test edge cases**: 
   - Request ride while one is active
   - Accept ride while driver is busy
   - Cancel ride at different stages
   - Rate ride multiple times
4. **Use Postman** or similar tools for easier testing
5. **Check response status codes** to verify correct behavior
6. **Verify data persistence** by checking MongoDB

---

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ride-booking

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000
```

---

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

---

## License
MIT
