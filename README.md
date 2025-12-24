# Ride Booking API

A secure, scalable, and role-based backend API for a ride booking system (Uber/Pathao style) built with Express.js, TypeScript, and Mongoose.

**Live API**: Deployed on Vercel

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
