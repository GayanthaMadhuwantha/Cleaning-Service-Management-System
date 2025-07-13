# CleanPro - Cleaning Service Booking Application

A full-stack web application for booking and managing cleaning services, built with React, Express.js, and MySQL.

## Features

### User Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing with bcrypt

### Booking Management
- Create new cleaning service bookings
- View all user bookings in a dashboard
- Edit existing bookings
- Cancel bookings
- Form validation for all required fields

### Services
- Multiple cleaning service types (Deep Cleaning, Carpet Cleaning, etc.)
- Service pricing and duration information
- Service descriptions

### Database Schema
- Users table with authentication
- Services table with predefined cleaning services
- Bookings table with foreign key relationships
- Status tracking (pending, confirmed, completed, cancelled)

## Technology Stack

### Frontend
- React 18 with JSX
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls

### Backend
- Express.js server
- MySQL database with mysql2
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL database server

### Database Setup
1. Create a MySQL database named `cleaning_service`
2. Update the `.env` file with your database credentials
3. Run server/Cleaning Service Management System.sql` to create tables

### Environment Variables
Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=cleaning_service
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
```

### Installation
```bash
npm install in both client and server folder
```

### Running the Application
```bash
# Start both frontend and backend using
npm start


## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Bookings (Protected)
- `GET /api/bookings` - Get all user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `DELETE /api/bookings/permanently/:id` - permanently delete booking

### Services
- `GET /api/services` - Get all available services
