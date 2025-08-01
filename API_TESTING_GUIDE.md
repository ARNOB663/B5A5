# 🚗 Ride Booking API - Testing Documentation

## 📋 Base Information

- **Base URL**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api`
- **Content-Type**: `application/json` (for all POST/PATCH requests)
- **Authentication**: Bearer Token in Authorization header

---

## 🔐 Authentication Endpoints

### 1. Register New User (Rider/Admin)

**Endpoint**: `POST /api/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890",
  "role": "rider"
}
```

**cURL Example**:
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

**Success Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "rider",
      "isActive": true,
      "isBlocked": false,
      "createdAt": "2025-07-28T14:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-07-28T14:30:00.000Z"
}
```

---

### 2. Register New Driver

**Endpoint**: `POST /api/auth/register/driver`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "firstName": "Mike",
  "lastName": "Driver",
  "email": "mike@example.com",
  "password": "SecurePass123",
  "phone": "+1234567891",
  "role": "driver",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "licensePlate": "ABC123",
    "color": "Blue"
  },
  "licenseNumber": "DL123456789"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/auth/register/driver \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Mike",
    "lastName": "Driver",
    "email": "mike@example.com",
    "password": "SecurePass123",
    "phone": "+1234567891",
    "role": "driver",
    "vehicleInfo": {
      "make": "Toyota",
      "model": "Camry", 
      "year": 2022,
      "licensePlate": "ABC123",
      "color": "Blue"
    },
    "licenseNumber": "DL123456789"
  }'
```

---

### 3. User Login

**Endpoint**: `POST /api/auth/login`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "rider",
      "isActive": true,
      "isBlocked": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-07-28T14:35:00.000Z"
}
```

---

### 4. Get User Profile

**Endpoint**: `GET /api/auth/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🚗 Ride Management Endpoints

### 1. Request a Ride (Rider Only)

**Endpoint**: `POST /api/rides/request`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "pickupLocation": {
    "address": "123 Main Street, New York, NY",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "destinationLocation": {
    "address": "456 Broadway, New York, NY",
    "coordinates": {
      "latitude": 40.7589,
      "longitude": -73.9851
    }
  },
  "rideType": "standard"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/rides/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN" \
  -d '{
    "pickupLocation": {
      "address": "123 Main Street, New York, NY",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    },
    "destinationLocation": {
      "address": "456 Broadway, New York, NY", 
      "coordinates": {
        "latitude": 40.7589,
        "longitude": -73.9851
      }
    },
    "rideType": "standard"
  }'
```

---

### 2. Get Available Rides (Driver Only)

**Endpoint**: `GET /api/rides/available`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/rides/available \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN"
```

---

### 3. Accept a Ride (Driver Only)

**Endpoint**: `PATCH /api/rides/{rideId}/accept`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**cURL Example**:
```bash
curl -X PATCH http://localhost:3000/api/rides/64f1a2b3c4d5e6f7g8h9i0j2/accept \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN"
```

---

### 4. Update Ride Status (Driver Only)

**Endpoint**: `PATCH /api/rides/{rideId}/status`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "status": "picked_up"
}
```

**Valid Status Values**: `accepted`, `rejected`, `picked_up`, `in_transit`, `completed`

**cURL Example**:
```bash
curl -X PATCH http://localhost:3000/api/rides/64f1a2b3c4d5e6f7g8h9i0j2/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DRIVER_TOKEN" \
  -d '{"status": "picked_up"}'
```

---

### 5. Get Ride History (Rider)

**Endpoint**: `GET /api/rides/history?page=1&limit=10`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**cURL Example**:
```bash
curl -X GET "http://localhost:3000/api/rides/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_RIDER_TOKEN"
```

---

## 👑 Admin Endpoints

### 1. Get All Users

**Endpoint**: `GET /api/admin/users?role=rider&page=1&limit=10`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**cURL Example**:
```bash
curl -X GET "http://localhost:3000/api/admin/users?role=rider&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 2. Get Pending Drivers

**Endpoint**: `GET /api/admin/drivers/pending`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**cURL Example**:
```bash
curl -X GET http://localhost:3000/api/admin/drivers/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 3. Approve/Reject Driver

**Endpoint**: `PATCH /api/admin/drivers/{driverId}/approve`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body (Approve)**:
```json
{
  "isApproved": true
}
```

**Request Body (Reject)**:
```json
{
  "isApproved": false,
  "rejectionReason": "Invalid license documentation"
}
```

**cURL Example**:
```bash
curl -X PATCH http://localhost:3000/api/admin/drivers/64f1a2b3c4d5e6f7g8h9i0j3/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"isApproved": true}'
```

---

### 4. Block/Unblock User

**Endpoint**: `PATCH /api/admin/users/{userId}/block`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body (Block)**:
```json
{
  "isBlocked": true,
  "blockReason": "Violation of terms of service"
}
```

**Request Body (Unblock)**:
```json
{
  "isBlocked": false
}
```

**cURL Example**:
```bash
curl -X PATCH http://localhost:3000/api/admin/users/64f1a2b3c4d5e6f7g8h9i0j1/block \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "isBlocked": true,
    "blockReason": "Violation of terms of service"
  }'
```

---

## 🧪 Testing Workflow

### Step 1: Create Admin User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "AdminPass123",
    "phone": "+1111111111",
    "role": "admin"
  }'
```

### Step 2: Create Rider
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Rider",
    "email": "rider@example.com", 
    "password": "RiderPass123",
    "phone": "+2222222222",
    "role": "rider"
  }'
```

### Step 3: Create Driver
```bash
curl -X POST http://localhost:3000/api/auth/register/driver \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bob",
    "lastName": "Driver",
    "email": "driver@example.com",
    "password": "DriverPass123", 
    "phone": "+3333333333",
    "role": "driver",
    "vehicleInfo": {
      "make": "Honda",
      "model": "Civic",
      "year": 2023,
      "licensePlate": "XYZ789",
      "color": "Red"
    },
    "licenseNumber": "DL987654321"
  }'
```

### Step 4: Admin Approves Driver
1. Login as admin and get token
2. Get pending drivers list
3. Approve the driver using their ID

### Step 5: Test Ride Flow
1. Rider requests ride
2. Driver gets available rides
3. Driver accepts ride
4. Driver updates status: picked_up → in_transit → completed

---

## ⚠️ Common Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "email: Invalid email format",
  "timestamp": "2025-07-28T14:40:00.000Z"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Invalid or expired token",
  "timestamp": "2025-07-28T14:40:00.000Z"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "timestamp": "2025-07-28T14:40:00.000Z"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Route /api/nonexistent not found",
  "timestamp": "2025-07-28T14:40:00.000Z"
}
```

---

## 📊 System Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Welcome/Info
```bash
curl http://localhost:3000/
```

---

## 🔑 Notes

1. **Save the JWT tokens** from login/register responses for authenticated requests
2. **JWT tokens expire in 160 days** as configured
3. **Drivers must be approved by admin** before they can accept rides
4. **Use proper role-based tokens** for different endpoints
5. **All timestamps are in ISO 8601 format**

This documentation covers all the main API endpoints with proper headers, authentication, and example requests/responses! 🚀
