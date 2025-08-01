# Ride Booking API

A secure, scalable, and role-based backend API for a ride booking system (Uber/Pathao style) built with Express.js, TypeScript, and Mongoose.

## Features
- JWT authentication (admin, rider, driver)
- Secure password hashing (bcrypt)
- Rider: request/cancel rides, view history
- Driver: accept/reject rides, update status, view earnings, set availability
- Admin: manage users/drivers/rides, approve/suspend/block, dashboard stats
- Modular code architecture
- Role-based route protection
- Complete ride history
- RESTful API endpoints

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
1. Clone repo & install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` file (see example in repo)
3. Build & run:
   ```bash
   npm run build
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

## API Endpoints
See Postman collection for full documentation.

## API Testing

To test the Ride Booking API, use [Postman](https://www.postman.com/) or any REST client. Below are example steps and endpoints to verify core features:

### 1. Authentication

**Register**
- Endpoint: `POST /api/auth/register`
- Request Body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "yourpassword",
    "phone": "+1234567890",
    "role": "rider" // or "driver" or "admin"
  }
  ```
- Headers: `Content-Type: application/json`

**Login**
- Endpoint: `POST /api/auth/login`
- Request Body:
  ```json
  {
    "email": "john@example.com",
    "password": "yourpassword"
  }
  ```
- Headers: `Content-Type: application/json`
- Response: JWT token (use in Authorization header for protected routes)

### 2. Rider Flow

**Request Ride**
- Endpoint: `POST /api/rides/request`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT token>`
- Request Body:
  ```json
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

**Cancel Ride**
- Endpoint: `PATCH /api/rides/:rideId/cancel`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT token>`
- Request Body:
  ```json
  {
    "reason": "Change of plans"
  }
  ```

**View Ride History**
- Endpoint: `GET /api/rides/me`
- Headers:
  - `Authorization: Bearer <JWT token>`

### 3. Driver Flow

**Register as Driver**
- Endpoint: `POST /api/auth/driver/register`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT token>`
- Request Body:
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

**Set Availability**
- Endpoint: `PATCH /api/driver/availability`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT token>`
- Request Body:
  ```json
  {
    "status": "online", // or "offline"
    "location": {
      "latitude": 23.8103,
      "longitude": 90.4125
    }
  }
  ```

**View Available Rides**
- Endpoint: `GET /api/rides/available`
- Headers:
  - `Authorization: Bearer <JWT token>`

**Accept Ride**
- Endpoint: `PATCH /api/rides/:rideId/accept`
- Headers:
  - `Authorization: Bearer <JWT token>`

**Update Ride Status**
- Endpoint: `PATCH /api/rides/:rideId/status`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT token>`
- Request Body:
  ```json
  {
    "status": "picked_up" // or "in_transit" or "completed"
  }
  ```

**View Earnings**
- Endpoint: `GET /api/driver/earnings`
- Headers:
  - `Authorization: Bearer <JWT token>`

### 4. Admin Flow

**View Users**
- Endpoint: `GET /api/admin/users`
- Headers:
  - `Authorization: Bearer <JWT token>`

**Approve/Suspend Driver**
- Endpoint: `PATCH /api/admin/drivers/:driverId/approve` or `PATCH /api/admin/drivers/:driverId/suspend`
- Headers:
  - `Authorization: Bearer <JWT token>`

**Block/Unblock User**
- Endpoint: `PATCH /api/admin/users/:userId/block` or `PATCH /api/admin/users/:userId/unblock`
- Headers:
  - `Authorization: Bearer <JWT token>`

**View All Rides**
- Endpoint: `GET /api/admin/rides`
- Headers:
  - `Authorization: Bearer <JWT token>`

**Dashboard Stats**
- Endpoint: `GET /api/admin/dashboard/stats`
- Headers:
  - `Authorization: Bearer <JWT token>`

### 5. General

**Welcome Page**
- Endpoint: `GET /`
- Description: Welcome message and API overview

**Health Check**
- Endpoint: `GET /health`

#### Tips

- Always include the JWT token in the `Authorization` header: `Bearer <token>`
- Test edge cases: blocked users, suspended drivers, ride cancellation rules, etc.
- Use the provided Postman collection for ready-made requests and test flows.

For more details, see the API documentation and demo video.

## Testing
- Use Postman for endpoint testing

## Demo Video
- See submitted screen recording for walkthrough

## License
MIT
