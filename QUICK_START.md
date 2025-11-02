# ⚡ Quick Start Guide

Get the Student Management System running in 5 minutes!

## 🎯 Prerequisites

- Node.js installed
- MongoDB installed or MongoDB Atlas account

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies


# Install client dependencies
cd ../client && npm install
```cd server && npm install

### 2. Configure Environment Variables

**Create `server/.env`:**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_management
JWT_SECRET=mysecretkey_change_this
NODE_ENV=development
```

**Create `client/.env`:**

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

```bash
# Windows - MongoDB should auto-start as service
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 4. Run the Application

From the root directory:

```bash
npm start
```

This starts both backend (port 5000) and frontend (port 3000).

### 5. Access the Application

Open your browser and go to: **http://localhost:3000**

## 🎓 First Steps

1. **Register an Admin Account**
   - Click "Create new account"
   - Fill in details
   - Select "Admin" role
   - Register

2. **Create a Class**
   - Go to Classes
   - Click "Add Class"
   - Fill in class details

3. **Add Teachers**
   - Go to Teachers
   - Click "Add Teacher"
   - Fill in teacher details

4. **Add Students**
   - Go to Students
   - Click "Add Student"
   - Fill in student details
   - Assign to a class

5. **Mark Attendance**
   - Go to Attendance
   - Select class and date
   - Mark attendance for students

6. **Add Grades**
   - Go to Grades
   - Click "Add Grade"
   - Enter exam details and marks

7. **View Reports**
   - Go to Reports
   - View statistics and analytics

## 🎨 Default Login (After Creating Accounts)

Create these test accounts for different roles:

**Admin:**
- Email: admin@school.com
- Password: admin123
- Role: Admin

**Teacher:**
- Email: teacher@school.com
- Password: teacher123
- Role: Teacher

**Student:**
- Email: student@school.com
- Password: student123
- Role: Student

## 💡 Tips

- Always start with creating classes first
- Then add teachers and students
- The system automatically calculates grades and percentages
- Use the dashboard for a quick overview

## ❓ Having Issues?

Check the full [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed troubleshooting.

---

**That's it! You're ready to manage your school! 🎉**

