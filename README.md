# Ride Booking API

A secure, scalable, and role-based backend API for a ride booking system (Uber/Pathao style) built with Express.js, TypeScript, Mongoose, and Socket.io.

**Live API**: Deployed on Vercel

## Features
- **Authentication**: JWT-based auth (admin, rider, driver), password hashing (bcrypt).
- **Real-time Updates**: Socket.io integration for live driver location and ride status updates.
- **Rider**: Request/cancel rides, view history, rate rides, update profile.
- **Driver**: Accept/reject rides, update status, view earnings, set availability, view reviews.
- **Admin**: Dashboard stats, user management.
- **Core**: Geo-based matching, fare calculation, modular architecture.

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ARNOB663/B5A5.git
    cd B5A5
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory (see `.env.example`):
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    NODE_ENV=development
    ```

4.  **Run the Server**
    ```bash
    npm run dev
    ```

## API Documentation & Testing Bodies

Base URL: `http://localhost:3000/api/v1`

### 1. Authentication

#### Register User (Rider)
- **Endpoint**: `POST /auth/register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "01700000000",
    "role": "rider"
  }
  ```

#### Register Driver
- **Endpoint**: `POST /auth/register` (First register as user with role "driver")
- **Body**:
  ```json
  {
    "name": "Jane Driver",
    "email": "driver@example.com",
    "password": "password123",
    "phone": "01800000000",
    "role": "driver"
  }
  ```
- **Then, Register Driver Details**: `POST /auth/driver/register` (Auth required)
- **Body**:
  ```json
  {
    "licenseNumber": "D-12345",
    "vehicleInfo": {
      "make": "Toyota",
      "model": "Corolla",
      "year": 2018,
      "plateNumber": "DHA-1234",
      "color": "White"
    }
  }
  ```

#### Login
- **Endpoint**: `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: Returns a token. Use this token in the `Authorization` header as `Bearer <token>` for protected routes.

#### Get Profile
- **Endpoint**: `GET /auth/profile`
- **Headers**: `Authorization: Bearer <token>`

#### Update Profile
- **Endpoint**: `PATCH /auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "John updated",
    "phone": "01799999999"
  }
  ```

### 2. Ride Service

#### Request a Ride
- **Endpoint**: `POST /rides/request`
- **Headers**: `Authorization: Bearer <token>` (Rider)
- **Body**:
  ```json
  {
    "pickupLocation": {
      "address": "Dhaka, Bangladesh",
      "latitude": 23.8103,
      "longitude": 90.4125
    },
    "destination": {
      "address": "Uttara, Dhaka",
      "latitude": 23.8759,
      "longitude": 90.3800
    }
  }
  ```

#### Get Ride History
- **Endpoint**: `GET /rides/me`
- **Headers**: `Authorization: Bearer <token>`

#### Rate a Ride
- **Endpoint**: `POST /rides/:rideId/rate`
- **Headers**: `Authorization: Bearer <token>` (Rider)
- **Body**:
  ```json
  {
    "rating": 5,
    "feedback": "Great ride, safe driving!"
  }
  ```

### 3. Driver Service

#### Set Availability
- **Endpoint**: `PATCH /drivers/availability`
- **Headers**: `Authorization: Bearer <token>` (Driver)
- **Body**:
  ```json
  {
    "status": "online",
    "location": {
      "latitude": 23.8103,
      "longitude": 90.4125
    }
  }
  ```

#### Update Live Location (Real-time)
- **Endpoint**: `PATCH /drivers/location`
- **Headers**: `Authorization: Bearer <token>` (Driver)
- **Body**:
  ```json
  {
    "latitude": 23.8105,
    "longitude": 90.4128
  }
  ```

#### Get Nearby Requests
- **Endpoint**: `GET /drivers/requests`
- **Headers**: `Authorization: Bearer <token>` (Driver)

#### Accept Ride
- **Endpoint**: `PUT /rides/:rideId/accept`
- **Headers**: `Authorization: Bearer <token>` (Driver)

#### Update Ride Status
- **Endpoint**: `PUT /rides/:rideId/status`
- **Headers**: `Authorization: Bearer <token>` (Driver)
- **Body**:
  ```json
  {
    "status": "in_transit"
  }
  ```
  *(Options: `picked_up`, `in_transit`, `completed`)*

#### Update Vehicle Info
- **Endpoint**: `PATCH /drivers/vehicle`
- **Headers**: `Authorization: Bearer <token>` (Driver)
- **Body**:
  ```json
  {
    "vehicleInfo": {
      "color": "Black"
    }
  }
  ```

#### Get Reviews
- **Endpoint**: `GET /drivers/:driverId/reviews`
- **Headers**: `Authorization: Bearer <token>`

## Real-time Events (Socket.io)

Connect your frontend Socket.io client to the server URL.

**Events to Listen For:**
- `driver:location_update` - Receive live location updates from all online drivers.
- `ride:request` - (Driver) Receive new ride request notifications.
- `ride:accepted` - (Rider) Notification when a driver accepts your ride.
- `ride:status_change` - (Rider/Driver) Notification when ride status updates (e.g. "Arrived", "Completed").

---
**Author**: Arnob
