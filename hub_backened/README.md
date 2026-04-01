# Fitness Tracking API

A comprehensive MERN stack fitness tracking API built with Node.js, Express, and MongoDB.

## Features

- User authentication and profiles
- Workout logging and tracking
- Calorie intake tracking
- Sleep, steps, weight, and water tracking
- Admin functionality
- Image uploads
- Reports

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **File Uploads**: Multer, Cloudinary
- **Email**: Nodemailer

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   ```
   MONGO_URL=your_mongodb_connection_string
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret
   ```
4. Run the server: `npm start` (development: `npm run dev`)

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### User Profiles
- `POST /user-profiles` - Create/update user profile
- `GET /user-profiles` - Get user profile
- `PUT /user-profiles` - Update user profile
- `DELETE /user-profiles` - Delete user profile

### Workouts
- `POST /workouts` - Create a workout
- `GET /workouts` - Get all workouts (with optional date filter)
- `GET /workouts/:id` - Get specific workout
- `PUT /workouts/:id` - Update workout
- `DELETE /workouts/:id` - Delete workout

### Other Tracking
- `POST /calorieintake/addcalorieentry` - Add calorie intake
- `POST /sleeptrack/addsleepentry` - Add sleep entry
- `POST /steptrack/addstepentry` - Add steps entry
- `POST /weighttrack/addweightentry` - Add weight entry
- `POST /watertrack/addwaterentry` - Add water intake
- `POST /workouttrack/addworkoutentry` - Add workout entry (legacy)

### Admin
- Admin-specific routes for user management

### Reports
- `GET /report/*` - Various report endpoints

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Data Models

### User
- name, email, password, weight[], height[], gender, dob, goal, activityLevel, etc.

### UserProfile
- userId, goal, activityLevel, targetWeight, fitnessPreferences, medicalNotes

### Workout
- userId, exerciseName, duration, intensity, date, sets, reps, weight, caloriesBurned, notes

## Running the Server

```bash
npm start
```

Server runs on http://localhost:8000

## Testing

Use tools like Postman to test the endpoints. Ensure to include authentication headers for protected routes.