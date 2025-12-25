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

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/driver/register` - Register as driver
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get current user profile
- `PATCH /api/v1/auth/profile` - Update profile details

### Driver Service
- `PATCH /api/v1/drivers/availability` - Set online/offline status
- `PATCH /api/v1/drivers/location` - Update live location (emits socket event)
- `GET /api/v1/drivers/requests` - Get nearby ride requests
- `GET /api/v1/drivers/earnings` - View earnings history
- `GET /api/v1/drivers/:id/reviews` - View driver reviews
- `PATCH /api/v1/drivers/vehicle` - Update vehicle information

### Ride Service
- `POST /api/v1/rides/request` - Request a new ride
- `GET /api/v1/rides/me` - Get ride history
- `GET /api/v1/rides/current` - Get active ride
- `PUT /api/v1/rides/:id/accept` - Accept a ride (Driver only)
- `PUT /api/v1/rides/:id/status` - Update ride status (Picked Up, Completed, etc.)
- `POST /api/v1/rides/:id/rate` - Rate a completed ride

## Real-time Events (Socket.io)
Connect to the base URL to listen for events:
- `driver:location_update` - Broadcasts driver location changes.
- `ride:request` - Emitted to drivers when a new ride is requested.
- `ride:accepted` - Emitted to rider when driver accepts.
- `ride:status_change` - Emitted to relevant parties when ride status changes.

## Setup
1. Install dependencies: `npm install`
2. Set up `.env` file (see `.env.example`).
3. Run development server: `npm run dev`
4. Build for production: `npm run build`
