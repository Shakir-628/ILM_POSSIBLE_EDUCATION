# 📚 Student Management System - API Documentation v2.0

## Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",  // admin, teacher, or student
  "phone": "1234567890"
}
```

### **Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### **Forgot Password**
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### **Reset Password**
```http
POST /auth/reset-password/:token
Content-Type: application/json

{
  "password": "newPassword123"
}
```

### **Get Profile**
```http
GET /auth/profile
Authorization: Bearer TOKEN
```

### **Update Profile**
```http
PUT /auth/profile
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "0987654321"
}
```

---

## 👨‍🎓 Students

### **Get All Students**
```http
GET /students
Authorization: Bearer TOKEN
```

### **Get Student by ID**
```http
GET /students/:id
Authorization: Bearer TOKEN
```

### **Create Student**
```http
POST /students
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "studentId": "S001",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "1234567890",
  "dateOfBirth": "2005-01-15",
  "gender": "female",
  "guardianName": "Parent Name",
  "guardianPhone": "0987654321",
  "classId": "CLASS_ID",
  "password": "student123"  // Optional, defaults to "student123"
}
```

### **Update Student**
```http
PUT /students/:id
Authorization: Bearer TOKEN
Content-Type: application/json
```

### **Delete Student**
```http
DELETE /students/:id
Authorization: Bearer TOKEN
```

---

## 👨‍🏫 Teachers

### **Get All Teachers**
```http
GET /teachers
Authorization: Bearer TOKEN
```

### **Create Teacher**
```http
POST /teachers
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "teacherId": "T001",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@school.com",
  "phone": "1234567890",
  "dateOfBirth": "1985-05-15",
  "gender": "male",
  "qualification": "Masters in Mathematics",
  "specialization": "Mathematics",
  "experience": 5,
  "password": "teacher123"  // Optional
}
```

---

## 📚 Classes

### **Get All Classes**
```http
GET /classes
Authorization: Bearer TOKEN
```

### **Create Class**
```http
POST /classes
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "className": "Grade 10",
  "grade": "10",
  "section": "A",
  "teacherId": "TEACHER_ID"
}
```

---

## 📅 Attendance

### **Mark Attendance**
```http
POST /attendance/mark
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "classId": "CLASS_ID",
  "date": "2025-11-01",
  "attendanceRecords": [
    {
      "studentId": "STUDENT_ID",
      "status": "present"
    }
  ]
}
```

### **Get Attendance Records**
```http
GET /attendance?classId=CLASS_ID&date=2025-11-01
Authorization: Bearer TOKEN
```

---

## 📝 Assignments

### **Get All Assignments**
```http
GET /assignments
Authorization: Bearer TOKEN

Query Parameters:
- classId (optional)
- status (optional): draft, published, closed
```

### **Get Assignment by ID**
```http
GET /assignments/:id
Authorization: Bearer TOKEN
```

### **Create Assignment** (Teacher/Admin)
```http
POST /assignments
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

title: Math Homework
description: Complete exercises 1-10
classId: CLASS_ID
subjectId: SUBJECT_ID (optional)
teacherId: TEACHER_ID
dueDate: 2025-11-10
totalMarks: 100
instructions: Read chapter 5 before starting
status: published
files: [file1, file2]  // Max 5 files, 10MB each
```

### **Update Assignment**
```http
PUT /assignments/:id
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

### **Delete Assignment**
```http
DELETE /assignments/:id
Authorization: Bearer TOKEN
```

### **Get Assignment Submissions**
```http
GET /assignments/:id/submissions
Authorization: Bearer TOKEN
```

### **Get Assignment Statistics**
```http
GET /assignments/:id/stats
Authorization: Bearer TOKEN

Response:
{
  "totalSubmissions": 25,
  "gradedSubmissions": 20,
  "pendingSubmissions": 5,
  "lateSubmissions": 3,
  "averageMarks": 78.5
}
```

---

## 📤 Submissions

### **Get All Submissions**
```http
GET /submissions
Authorization: Bearer TOKEN

Query Parameters:
- studentId (optional)
- assignmentId (optional)
- status (optional): submitted, graded, late, resubmitted
```

### **Submit Assignment** (Student)
```http
POST /submissions
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

assignmentId: ASSIGNMENT_ID
studentId: STUDENT_ID
comments: Here is my submission
files: [file1, file2]  // Max 5 files, 10MB each
```

### **Resubmit Assignment**
```http
PUT /submissions/:id
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

comments: Updated submission
files: [additional files]
```

### **Grade Submission** (Teacher/Admin)
```http
PUT /submissions/:id/grade
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "marks": 85,
  "feedback": "Good work! Need improvement in question 5.",
  "teacherId": "TEACHER_ID"
}
```

### **Get Student's Submissions**
```http
GET /submissions/student/:studentId
Authorization: Bearer TOKEN
```

---

## 📢 Announcements

### **Get All Announcements**
```http
GET /announcements
Authorization: Bearer TOKEN

Query Parameters:
- status (optional): draft, published, archived
- pinned (optional): true, false
```

### **Get Announcement by ID**
```http
GET /announcements/:id
Authorization: Bearer TOKEN
```

### **Create Announcement** (Admin/Teacher)
```http
POST /announcements
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

title: Important Notice
content: School will be closed tomorrow
createdBy: USER_ID
audienceType: all  // all, classes, or roles
audienceClasses: [CLASS_ID1, CLASS_ID2]  // if audienceType is "classes"
audienceRoles: ["student", "teacher"]    // if audienceType is "roles"
pinned: true
priority: high  // low, normal, high, urgent
expiresAt: 2025-11-15
files: [file1, file2]
```

### **Update Announcement**
```http
PUT /announcements/:id
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

### **Delete Announcement** (Admin only)
```http
DELETE /announcements/:id
Authorization: Bearer TOKEN
```

### **Toggle Pin** (Admin)
```http
PUT /announcements/:id/pin
Authorization: Bearer TOKEN
```

### **Get User Announcements**
```http
GET /announcements/user/:userId?role=student&classId=CLASS_ID
Authorization: Bearer TOKEN
```

---

## 📊 Reports

### **Export Students List** (Excel)
```http
GET /reports/students
Authorization: Bearer TOKEN

Query Parameters:
- classId (optional)
- status (optional)

Response: Excel file download
```

### **Export Attendance Report** (Excel)
```http
GET /reports/attendance?classId=CLASS_ID&date=2025-11-01
Authorization: Bearer TOKEN

Response: Excel file download
```

### **Generate Student Report** (PDF)
```http
GET /reports/student/:id
Authorization: Bearer TOKEN

Response: PDF file download
```

### **Export Class Performance** (Excel)
```http
GET /reports/class/:id/performance
Authorization: Bearer TOKEN

Response: Excel file download
```

### **Get Report Statistics**
```http
GET /reports/stats
Authorization: Bearer TOKEN

Response:
{
  "totalStudents": 250,
  "totalClasses": 10,
  "todayAttendance": {
    "total": 240,
    "present": 230,
    "absent": 10,
    "rate": "95.83"
  }
}
```

---

## 🎯 Grades

### **Get All Grades**
```http
GET /grades
Authorization: Bearer TOKEN
```

### **Create Grade**
```http
POST /grades
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "studentId": "STUDENT_ID",
  "subjectId": "SUBJECT_ID",
  "term": "First Term",
  "marks": 85,
  "grade": "A"
}
```

---

## 📁 File Management

### **File Types Allowed**
- Images: JPG, JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- Archives: ZIP

### **Size Limits**
- Max file size: 10 MB per file
- Max files per upload: 5 files

### **Access Uploaded Files**
```
GET http://localhost:5000/uploads/{type}/{filename}

Examples:
- http://localhost:5000/uploads/assignments/file-123456.pdf
- http://localhost:5000/uploads/submissions/file-789012.pdf
```

---

## ⚠️ Error Responses

All errors follow this format:
```json
{
  "message": "Error description"
}
```

### **Common Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## 🔑 Role-Based Access

### **Admin**
- Full access to all endpoints
- Can manage students, teachers, classes
- Can delete announcements
- Can view all reports

### **Teacher**
- Can create and manage assignments
- Can grade submissions
- Can create announcements
- Can mark attendance
- Can view reports

### **Student**
- Can view assignments
- Can submit assignments
- Can view own submissions and grades
- Can view announcements
- Can view own attendance

---

## 📧 Email Notifications

The system automatically sends emails for:

1. **Password Reset** - When user requests password reset
2. **Assignment Posted** - When teacher creates new assignment
3. **Grade Posted** - When teacher grades a submission

---

## 🚀 Testing with Postman/Thunder Client

### **1. Register/Login**
First, get your JWT token by logging in.

### **2. Set Authorization Header**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### **3. Test Endpoints**
Start with GET requests, then try POST/PUT/DELETE.

### **4. File Uploads**
Use `multipart/form-data` content type for file uploads.

---

## 📚 Sample Workflow

### **Teacher Workflow:**
1. Login → Get token
2. Create Assignment (POST /assignments with files)
3. View Submissions (GET /assignments/:id/submissions)
4. Grade Submissions (PUT /submissions/:id/grade)
5. Export Reports (GET /reports/class/:id/performance)

### **Student Workflow:**
1. Login → Get token
2. View Assignments (GET /assignments)
3. Submit Assignment (POST /submissions with files)
4. View Grade (GET /submissions/student/:id)
5. Check Announcements (GET /announcements)

---

## 🎉 Ready to Use!

Your API is fully functional with:
- ✅ Authentication & Authorization
- ✅ Student & Teacher Management
- ✅ Assignment System
- ✅ Submission & Grading
- ✅ Announcements
- ✅ Reports (PDF/Excel)
- ✅ File Uploads
- ✅ Email Notifications

**Base URL:** `http://localhost:5000/api`

---

*Last Updated: November 1, 2025*  
*API Version: 2.0.0*

