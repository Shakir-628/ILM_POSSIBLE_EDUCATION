# 🎓 Student Management System (MERN Stack)

A comprehensive Student Management System built with MongoDB, Express, React, and Node.js in a monorepo structure.

## 🚀 Features

- **JWT-based Authentication** - Secure login and registration
- **Role-based Dashboard** - Different views for Admin, Teacher, and Student
- **CRUD Operations** - Manage Students, Teachers, Classes, Subjects, Attendance, and Grades
- **Attendance Management** - Track student attendance
- **Grade Management** - Record and manage student grades
- **Reports & Analytics** - Student performance summaries
- **Responsive UI** - Built with TailwindCSS
- **Secure Password Hashing** - Using bcrypt
- **Centralized Error Handling** - Consistent error management

## 📁 Project Structure

```
student-management-system/
│
├── server/                # Backend (Node.js + Express + MongoDB)
│   ├── config/            # DB config & environment setup
│   ├── controllers/       # Business logic for each route
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # JWT auth, error handling, validation
│   ├── utils/             # Helper functions
│   ├── server.js          # Express app entry point
│   └── .env               # Environment variables
│
├── client/                # Frontend (React + TailwindCSS)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Pages
│   │   ├── services/      # Axios API services
│   │   ├── context/       # Auth context
│   │   ├── App.js
│   │   └── index.js
│   └── tailwind.config.js
│
└── package.json           # Root-level scripts
```

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Install all dependencies:**
```bash
npm run install-all
```

Or install separately:
```bash
npm install
npm run install-server
npm run install-client
```

2. **Configure environment variables:**

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_management
JWT_SECRET=your_jwt_secret_key_here
```

3. **Run the application:**
```bash
npm start
```

This will run both the backend (port 5000) and frontend (port 3000) concurrently.

### Individual Commands

- **Run backend only:** `npm run server`
- **Run frontend only:** `npm run client`

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create new teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/:id` - Get attendance by ID
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### Grades
- `GET /api/grades` - Get all grades
- `GET /api/grades/:id` - Get grade by ID
- `POST /api/grades` - Create grade record
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

## 👥 User Roles

- **Admin** - Full access to all features
- **Teacher** - Manage classes, attendance, and grades
- **Student** - View own information, attendance, and grades

## 🎨 Frontend Pages

- **Login/Register** - Authentication pages
- **Dashboard** - Role-based overview
- **Students** - Manage student records (Admin/Teacher)
- **Teachers** - Manage teacher records (Admin)
- **Classes** - Manage classes (Admin/Teacher)
- **Attendance** - Track attendance (Teacher/Student view)
- **Grades** - Manage grades (Teacher/Student view)
- **Reports** - Performance analytics (Admin/Teacher)

## 🔧 Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Morgan for logging
- CORS

### Frontend
- React
- React Router DOM
- Axios for API calls
- TailwindCSS for styling
- Headless UI components
- Hero Icons

## 📝 License

ISC

## 👨‍💻 Author

Built with ❤️ using the MERN stack

