# 📚 API Documentation

Complete API reference for the Student Management System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login User

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get User Profile

```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "phone": "1234567890",
  "address": "123 Main St",
  "isActive": true
}
```

### Update User Profile

```http
PUT /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543210",
  "password": "newpassword123"
}
```

---

## 👨‍🎓 Student Endpoints

### Get All Students

```http
GET /students
```

**Access:** Admin, Teacher

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "studentId": "STU001",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "class": {
      "_id": "507f1f77bcf86cd799439012",
      "className": "Class 10-A"
    },
    "status": "active"
  }
]
```

### Get Student by ID

```http
GET /students/:id
```

**Access:** All authenticated users

### Create Student

```http
POST /students
```

**Access:** Admin only

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "studentId": "STU001",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "2008-05-15",
  "gender": "female",
  "email": "jane@example.com",
  "phone": "1234567890",
  "guardianName": "John Doe",
  "guardianPhone": "0987654321",
  "classId": "507f1f77bcf86cd799439012"
}
```

### Update Student

```http
PUT /students/:id
```

**Access:** Admin only

### Delete Student

```http
DELETE /students/:id
```

**Access:** Admin only

### Get Students by Class

```http
GET /students/class/:classId
```

**Access:** All authenticated users

---

## 👨‍🏫 Teacher Endpoints

### Get All Teachers

```http
GET /teachers
```

**Access:** All authenticated users

### Get Teacher by ID

```http
GET /teachers/:id
```

### Create Teacher

```http
POST /teachers
```

**Access:** Admin only

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "teacherId": "TCH001",
  "firstName": "Robert",
  "lastName": "Smith",
  "dateOfBirth": "1985-03-20",
  "gender": "male",
  "email": "robert@example.com",
  "phone": "1234567890",
  "qualification": "M.Sc. Mathematics",
  "specialization": "Mathematics",
  "experience": 10
}
```

### Update Teacher

```http
PUT /teachers/:id
```

**Access:** Admin only

### Delete Teacher

```http
DELETE /teachers/:id
```

**Access:** Admin only

---

## 📚 Class Endpoints

### Get All Classes

```http
GET /classes
```

**Access:** All authenticated users

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "className": "Class 10-A",
    "grade": "10",
    "section": "A",
    "classTeacher": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Robert",
      "lastName": "Smith"
    },
    "capacity": 30,
    "students": [],
    "academicYear": "2023-2024",
    "status": "active"
  }
]
```

### Get Class by ID

```http
GET /classes/:id
```

### Create Class

```http
POST /classes
```

**Access:** Admin only

**Request Body:**
```json
{
  "className": "Class 10-A",
  "grade": "10",
  "section": "A",
  "classTeacher": "507f1f77bcf86cd799439013",
  "capacity": 30,
  "room": "Room 101",
  "academicYear": "2023-2024"
}
```

### Update Class

```http
PUT /classes/:id
```

**Access:** Admin only

### Delete Class

```http
DELETE /classes/:id
```

**Access:** Admin only

### Add Student to Class

```http
PUT /classes/:id/add-student
```

**Access:** Admin only

**Request Body:**
```json
{
  "studentId": "507f1f77bcf86cd799439011"
}
```

### Remove Student from Class

```http
PUT /classes/:id/remove-student
```

**Access:** Admin only

**Request Body:**
```json
{
  "studentId": "507f1f77bcf86cd799439011"
}
```

---

## 📖 Subject Endpoints

### Get All Subjects

```http
GET /subjects
```

### Get Subject by ID

```http
GET /subjects/:id
```

### Create Subject

```http
POST /subjects
```

**Access:** Admin only

**Request Body:**
```json
{
  "subjectName": "Mathematics",
  "subjectCode": "MATH101",
  "description": "Advanced Mathematics",
  "teacher": "507f1f77bcf86cd799439013",
  "classId": "507f1f77bcf86cd799439012",
  "credits": 4,
  "type": "core"
}
```

### Get Subjects by Class

```http
GET /subjects/class/:classId
```

### Get Subjects by Teacher

```http
GET /subjects/teacher/:teacherId
```

---

## 📅 Attendance Endpoints

### Get Attendance Records

```http
GET /attendance?studentId=xxx&classId=yyy&startDate=2024-01-01&endDate=2024-12-31
```

**Query Parameters:**
- `studentId` - Filter by student
- `classId` - Filter by class
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "student": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "class": {
      "_id": "507f1f77bcf86cd799439012",
      "className": "Class 10-A"
    },
    "date": "2024-01-15",
    "status": "present",
    "markedBy": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Robert"
    }
  }
]
```

### Mark Attendance

```http
POST /attendance
```

**Access:** Teacher, Admin

**Request Body:**
```json
{
  "student": "507f1f77bcf86cd799439011",
  "classId": "507f1f77bcf86cd799439012",
  "date": "2024-01-15",
  "status": "present"
}
```

### Bulk Mark Attendance

```http
POST /attendance/bulk
```

**Access:** Teacher, Admin

**Request Body:**
```json
{
  "classId": "507f1f77bcf86cd799439012",
  "date": "2024-01-15",
  "attendanceRecords": [
    {
      "studentId": "507f1f77bcf86cd799439011",
      "status": "present"
    },
    {
      "studentId": "507f1f77bcf86cd799439015",
      "status": "absent"
    }
  ]
}
```

### Get Attendance Statistics

```http
GET /attendance/stats/:studentId?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "stats": [
    { "_id": "present", "count": 85 },
    { "_id": "absent", "count": 5 },
    { "_id": "late", "count": 3 }
  ],
  "totalDays": 93,
  "presentDays": 85,
  "attendancePercentage": "91.40"
}
```

---

## 📊 Grade Endpoints

### Get All Grades

```http
GET /grades?studentId=xxx&classId=yyy&academicYear=2023-2024&term=1st
```

**Query Parameters:**
- `studentId` - Filter by student
- `classId` - Filter by class
- `subjectId` - Filter by subject
- `academicYear` - Filter by academic year
- `term` - Filter by term

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "student": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Jane",
      "lastName": "Doe"
    },
    "subject": {
      "_id": "507f1f77bcf86cd799439017",
      "subjectName": "Mathematics",
      "subjectCode": "MATH101"
    },
    "examType": "midterm",
    "examName": "Mid-Term Examination",
    "examDate": "2024-02-15",
    "marksObtained": 85,
    "totalMarks": 100,
    "percentage": 85,
    "grade": "A",
    "academicYear": "2023-2024",
    "term": "1st"
  }
]
```

### Create Grade

```http
POST /grades
```

**Access:** Teacher, Admin

**Request Body:**
```json
{
  "student": "507f1f77bcf86cd799439011",
  "subject": "507f1f77bcf86cd799439017",
  "classId": "507f1f77bcf86cd799439012",
  "examType": "midterm",
  "examName": "Mid-Term Examination",
  "examDate": "2024-02-15",
  "marksObtained": 85,
  "totalMarks": 100,
  "academicYear": "2023-2024",
  "term": "1st"
}
```

### Get Student Report Card

```http
GET /grades/report/:studentId?academicYear=2023-2024&term=1st
```

**Response:**
```json
{
  "grades": [...],
  "subjectWiseGrades": {
    "Mathematics": {
      "subject": {...},
      "grades": [...]
    }
  },
  "statistics": {
    "totalMarks": 425,
    "totalPossible": 500,
    "overallPercentage": "85.00",
    "totalExams": 5
  }
}
```

### Get Class Grade Statistics

```http
GET /grades/class-stats/:classId?subjectId=xxx&examType=midterm
```

**Access:** Teacher, Admin

**Response:**
```json
{
  "gradeDistribution": [
    { "_id": "A+", "count": 8, "avgPercentage": 93.5 },
    { "_id": "A", "count": 12, "avgPercentage": 85.2 },
    { "_id": "B+", "count": 7, "avgPercentage": 75.8 }
  ],
  "overall": {
    "totalStudents": 30,
    "avgPercentage": "82.45",
    "maxPercentage": "96.00",
    "minPercentage": "45.00"
  }
}
```

---

## 📈 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## 🔒 Role-Based Access

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all endpoints |
| **Teacher** | Read: All, Write: Attendance, Grades, Own profile |
| **Student** | Read: Own data, attendance, grades |

## 📝 Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD)
- Percentage and grade are automatically calculated based on marks
- Attendance status options: `present`, `absent`, `late`, `excused`
- Exam types: `quiz`, `midterm`, `final`, `assignment`, `project`, `practical`

---

## 🧪 Testing with cURL

### Register and Login

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

### Get Protected Resource

```bash
# Replace <token> with the actual token from login
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer <token>"
```

---

**For Postman Collection, import the endpoints above into Postman using the import feature.**

