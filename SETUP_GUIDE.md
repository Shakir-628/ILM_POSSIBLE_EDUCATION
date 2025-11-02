# 🚀 Student Management System - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional, for version control)

## 🛠️ Installation Steps

### Step 1: Install Root Dependencies

From the root directory:

```bash
npm install
```

### Step 2: Setup Backend (Server)

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**MongoDB Configuration Options:**

**Option 1 - Local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/student_management
```

**Option 2 - MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/student_management?retryWrites=true&w=majority
```

### Step 3: Setup Frontend (Client)

Navigate to the client directory and install dependencies:

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit the `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Start MongoDB

**For Local MongoDB:**

Windows:
```bash
# MongoDB should start automatically as a service
# Or manually start it:
mongod
```

macOS:
```bash
brew services start mongodb-community
# Or manually:
mongod --config /usr/local/etc/mongod.conf
```

Linux:
```bash
sudo systemctl start mongod
# Or:
sudo service mongod start
```

**For MongoDB Atlas:**
- No need to start anything locally
- Just ensure your connection string is correct in the `.env` file
- Make sure your IP address is whitelisted in Atlas

## 🎯 Running the Application

### Option 1: Run Everything Together (Recommended)

From the **root directory**:

```bash
npm start
```

This will start both the backend (port 5000) and frontend (port 3000) concurrently.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/

## 👤 Default User Accounts

The system doesn't create default users automatically. You'll need to register users through the application:

1. Go to http://localhost:3000/register
2. Create accounts with different roles:
   - **Admin** - Full access to all features
   - **Teacher** - Manage classes, attendance, and grades
   - **Student** - View own information, attendance, and grades

### Sample Test Users

After registration, you can create these test accounts:

**Admin Account:**
- Name: Admin User
- Email: admin@school.com
- Password: admin123
- Role: Admin

**Teacher Account:**
- Name: John Teacher
- Email: teacher@school.com
- Password: teacher123
- Role: Teacher

**Student Account:**
- Name: Jane Student
- Email: student@school.com
- Password: student123
- Role: Student

## 📁 Project Structure

```
student-management-system/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── server.js         # Server entry point
│   └── package.json
│
├── client/               # Frontend (React)
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React Context
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   └── package.json
│
├── package.json         # Root package.json
└── README.md
```

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
Error: MongoDB Connection Error
```
**Solution:**
- Ensure MongoDB is running
- Check your connection string in `.env`
- For Atlas, verify IP whitelist and credentials

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change the PORT in server/.env
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### Frontend Issues

**Proxy Error:**
```
Error: ECONNREFUSED 127.0.0.1:5000
```
**Solution:**
- Ensure the backend server is running
- Check REACT_APP_API_URL in client/.env

**Module Not Found:**
```
Error: Cannot find module
```
**Solution:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

## 🧪 Testing the Application

### Test Backend API

Using curl or Postman:

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Frontend

1. Register a new account
2. Login with the account
3. Navigate through different pages
4. Test CRUD operations (Create, Read, Update, Delete)

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Student Endpoints

- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student (Admin only)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)

### Teacher Endpoints

- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create new teacher (Admin only)
- `PUT /api/teachers/:id` - Update teacher (Admin only)
- `DELETE /api/teachers/:id` - Delete teacher (Admin only)

### Class Endpoints

- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class (Admin only)
- `PUT /api/classes/:id` - Update class (Admin only)
- `DELETE /api/classes/:id` - Delete class (Admin only)

### Attendance Endpoints

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance (Teacher/Admin)
- `POST /api/attendance/bulk` - Bulk mark attendance (Teacher/Admin)
- `GET /api/attendance/stats/:studentId` - Get attendance stats

### Grade Endpoints

- `GET /api/grades` - Get all grades
- `POST /api/grades` - Create grade (Teacher/Admin)
- `GET /api/grades/report/:studentId` - Get student report card
- `GET /api/grades/class-stats/:classId` - Get class statistics

## 🚢 Deployment

### Backend Deployment (Heroku Example)

```bash
cd server
heroku create your-app-name
heroku config:set MONGO_URI="your-mongodb-atlas-uri"
heroku config:set JWT_SECRET="your-secret-key"
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

```bash
cd client
npm run build
# Deploy the build folder to your hosting service
```

## 📝 Environment Variables Reference

### Server (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/student_management |
| JWT_SECRET | Secret key for JWT | mysecretkey123 |
| NODE_ENV | Environment | development/production |

### Client (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |

## 🎓 Next Steps

1. **Populate the Database:**
   - Create classes first
   - Add teachers
   - Add students
   - Assign students to classes

2. **Explore Features:**
   - Mark attendance
   - Add grades
   - Generate reports

3. **Customize:**
   - Modify the UI colors in `client/tailwind.config.js`
   - Add more features as needed
   - Enhance security measures for production

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section
2. Review the error messages in the console
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly

## 📄 License

This project is licensed under the ISC License.

---

**Happy Coding! 🎉**

