# 🚀 Advanced Features - Student Management System

## 🎉 Overview

Your ILM Possible Education Management System now includes advanced features for a production-ready platform:

- ✅ **Assignments & Submissions** with file uploads
- ✅ **Announcements** with targeted audience
- ✅ **Report Generation** (PDF & Excel)
- ✅ **Email Notifications**
- ✅ **Audit Logging**
- ✅ **File Management**
- ✅ **Role-based Access Control**

---

## 📦 New Dependencies Added

### Backend (`server/package.json`)

```json
{
  "multer": "^1.4.5-lts.1",        // File uploads
  "joi": "^17.11.0",                // Validation
  "exceljs": "^4.4.0",              // Excel generation
  "pdfkit": "^0.14.0",              // PDF generation
  "nodemailer": "^6.9.7",           // Email sending
  "csv-parser": "^3.0.0",           // CSV parsing
  "fast-csv": "^5.0.1"              // CSV generation
}
```

### To Install

```bash
cd server
npm install
```

---

## 🗂️ New Models Created

### 1. Assignment Model
```javascript
{
  title: String,
  description: String,
  class: ObjectId (ref: Class),
  subject: ObjectId (ref: Subject),
  teacher: ObjectId (ref: Teacher),
  dueDate: Date,
  totalMarks: Number,
  attachments: [{ filename, path, size, mimeType }],
  status: enum['active', 'closed', 'draft']
}
```

### 2. Submission Model
```javascript
{
  assignment: ObjectId (ref: Assignment),
  student: ObjectId (ref: Student),
  files: [{ filename, path, size, mimeType }],
  content: String,
  submittedAt: Date,
  marks: Number,
  feedback: String,
  status: enum['submitted', 'graded', 'late'],
  gradedBy: ObjectId (ref: Teacher),
  gradedAt: Date
}
```

### 3. Announcement Model
```javascript
{
  title: String,
  content: String,
  audience: {
    type: enum['all', 'classes', 'roles'],
    classes: [ObjectId],
    roles: [String]
  },
  attachments: Array,
  createdBy: ObjectId (ref: User),
  pinned: Boolean,
  priority: enum['low', 'medium', 'high', 'urgent'],
  expiresAt: Date,
  status: enum['active', 'archived']
}
```

### 4. AuditLog Model
```javascript
{
  entity: String,
  action: String,
  entityId: ObjectId,
  user: ObjectId (ref: User),
  changes: Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

---

## 🔧 Services Created

### 1. File Service (`server/services/fileService.js`)
- **Upload files** using Multer
- **Delete files** from server
- **Process uploaded files** metadata
- **Generate file URLs**

**Supported File Types:**
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX
- Spreadsheets: XLS, XLSX, CSV
- Archives: ZIP

**File Size Limit:** 10MB per file

### 2. Email Service (`server/services/emailService.js`)
- **Send emails** via SMTP
- **Send assignment notifications**
- **Send grade notifications**
- **Send announcements**
- **Send forgot password emails**

### 3. Report Service (`server/services/reportService.js`)
- **Generate Student Report Card** (PDF)
- **Generate Class Report** (Excel)
- **Generate Attendance Report** (Excel)
- **Export Students Data** (Excel)

### 4. Audit Service (`server/services/auditService.js`)
- **Log all actions** automatically
- **Track user activity**
- **View entity history**
- **Audit middleware** for routes

---

## 📡 New API Endpoints

### **Assignments**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/assignments` | All | Get all assignments |
| GET | `/api/assignments/:id` | All | Get single assignment |
| POST | `/api/assignments` | Admin, Teacher | Create assignment |
| PUT | `/api/assignments/:id` | Admin, Teacher | Update assignment |
| DELETE | `/api/assignments/:id` | Admin, Teacher | Delete assignment |
| GET | `/api/assignments/student/:studentId` | All | Get student assignments |

### **Submissions**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/submissions/assignment/:assignmentId` | Admin, Teacher | Get all submissions |
| GET | `/api/submissions/student/:studentId/assignment/:assignmentId` | All | Get student submission |
| POST | `/api/submissions` | Student | Submit assignment |
| PUT | `/api/submissions/:id` | Student | Update submission (before grading) |
| PUT | `/api/submissions/:id/grade` | Admin, Teacher | Grade submission |
| DELETE | `/api/submissions/:id` | Student, Admin | Delete submission |

### **Announcements**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/announcements` | All | Get announcements (filtered by role) |
| GET | `/api/announcements/:id` | All | Get single announcement |
| POST | `/api/announcements` | Admin, Teacher | Create announcement |
| PUT | `/api/announcements/:id` | Admin, Creator | Update announcement |
| DELETE | `/api/announcements/:id` | Admin, Creator | Delete announcement |
| PATCH | `/api/announcements/:id/pin` | Admin | Toggle pin status |
| PATCH | `/api/announcements/:id/archive` | Admin, Creator | Archive announcement |

---

## 🔐 Environment Variables

Create `server/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/ILM_Possible

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
APP_NAME=ILM Possible Education

# Client URL (for email links)
CLIENT_URL=http://localhost:3000

# File Upload Configuration (optional)
MAX_FILE_SIZE=10485760
```

### Gmail Setup for Email

1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `EMAIL_PASS`

---

## 📂 File Structure

```
server/
├── models/
│   ├── Assignment.js          ✨ NEW
│   ├── Submission.js          ✨ NEW
│   ├── Announcement.js        ✨ NEW
│   ├── AuditLog.js            ✨ NEW
│   └── ...existing models
├── controllers/
│   ├── assignmentController.js    ✨ NEW
│   ├── submissionController.js    ✨ NEW
│   ├── announcementController.js  ✨ NEW
│   └── ...existing controllers
├── routes/
│   ├── assignmentRoutes.js    ✨ NEW
│   ├── submissionRoutes.js    ✨ NEW
│   ├── announcementRoutes.js  ✨ NEW
│   └── ...existing routes
├── services/
│   ├── fileService.js         ✨ NEW
│   ├── emailService.js        ✨ NEW
│   ├── reportService.js       ✨ NEW
│   └── auditService.js        ✨ NEW
├── uploads/                   ✨ NEW
│   ├── assignments/
│   ├── submissions/
│   ├── announcements/
│   └── reports/
└── server.js
```

---

## 🎯 Usage Examples

### 1. Creating an Assignment

**POST** `/api/assignments`

```bash
curl -X POST http://localhost:5000/api/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Math Homework 1" \
  -F "description=Complete exercises 1-10" \
  -F "classId=CLASS_ID" \
  -F "subjectId=SUBJECT_ID" \
  -F "teacherId=TEACHER_ID" \
  -F "dueDate=2025-11-10" \
  -F "totalMarks=100" \
  -F "files=@/path/to/file.pdf"
```

### 2. Submitting an Assignment

**POST** `/api/submissions`

```bash
curl -X POST http://localhost:5000/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "assignmentId=ASSIGNMENT_ID" \
  -F "studentId=STUDENT_ID" \
  -F "content=Here is my submission" \
  -F "files=@/path/to/submission.pdf"
```

### 3. Grading a Submission

**PUT** `/api/submissions/:id/grade`

```bash
curl -X PUT http://localhost:5000/api/submissions/SUBMISSION_ID/grade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marks": 85,
    "feedback": "Great work! Keep it up."
  }'
```

### 4. Creating an Announcement

**POST** `/api/announcements`

```bash
curl -X POST http://localhost:5000/api/announcements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "School Closed Tomorrow",
    "content": "Due to weather conditions, school will be closed",
    "audienceType": "all",
    "pinned": true,
    "priority": "urgent"
  }'
```

---

## 🔔 Email Notifications

The system automatically sends email notifications for:

1. **New Assignment Created**
   - Sent to: All students in the class
   - Contains: Assignment title, description, due date

2. **Assignment Graded**
   - Sent to: Student
   - Contains: Marks, grade, feedback

3. **New Announcement**
   - Sent to: Targeted audience (all/specific classes/roles)
   - Contains: Announcement title and content

---

## 📊 Audit Logging

All important actions are automatically logged:

- User login/logout
- Create/Update/Delete operations
- Assignment submissions
- Grade changes
- Announcement creation

**View Audit Logs:**
```javascript
import { getAuditLogs } from './services/auditService.js';

const logs = await getAuditLogs(
  { entity: 'Assignment', userId: 'USER_ID' },
  { page: 1, limit: 50 }
);
```

---

## 🔒 Security Features

1. **File Type Validation** - Only allowed file types can be uploaded
2. **File Size Limits** - Max 10MB per file
3. **Role-Based Access** - Authorization middleware on all routes
4. **JWT Authentication** - Secure token-based auth
5. **Audit Logging** - Track all user actions
6. **Input Sanitization** - Prevent XSS and injection attacks

---

## 🧪 Testing

### Test File Upload

```javascript
import { upload } from './services/fileService.js';

// In your route
app.post('/test-upload',
  (req, res, next) => {
    req.uploadFolder = 'test';
    next();
  },
  upload.single('file'),
  (req, res) => {
    res.json({ file: req.file });
  }
);
```

### Test Email

```javascript
import { sendEmail } from './services/emailService.js';

await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Hello</h1>',
  text: 'Hello'
});
```

### Test Report Generation

```javascript
import { generateStudentReportPDF } from './services/reportService.js';

const result = await generateStudentReportPDF(studentData, grades);
// result: { filename, filepath }
```

---

## 📈 Performance Optimization

1. **Database Indexes** - Added on frequently queried fields
2. **File Streaming** - Large files served efficiently
3. **Batch Email Sending** - Prevents overwhelming email server
4. **Lazy Loading** - Load data as needed
5. **Caching** - Future: Implement Redis caching

---

## 🚀 Next Steps

1. **Install dependencies**: `cd server && npm install`
2. **Configure .env** file
3. **Start server**: `npm run dev`
4. **Test endpoints** using Postman or curl
5. **Build frontend** components (next phase)

---

## 📚 Additional Resources

- [Multer Documentation](https://github.com/expressjs/multer)
- [Nodemailer Guide](https://nodemailer.com/)
- [ExcelJS API](https://github.com/exceljs/exceljs)
- [PDFKit Guide](https://pdfkit.org/)

---

## 🐛 Troubleshooting

### File Upload Issues

**Error: "Unexpected field"**
- Ensure field name matches (`files`, `file`, etc.)
- Check `upload.array()` or `upload.single()`

**Error: "File too large"**
- Increase limit in `fileService.js`
- Check client-side file size validation

### Email Issues

**Error: "Invalid login"**
- Use App Password for Gmail
- Enable "Less secure app access" (not recommended)
- Check EMAIL_USER and EMAIL_PASS

### MongoDB Issues

**Error: "Index already exists"**
- Drop collection and recreate
- Or drop specific index

---

## 🎯 Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Assignments | ✅ Complete | Create, upload, manage |
| Submissions | ✅ Complete | Submit, grade, feedback |
| Announcements | ✅ Complete | Post, pin, target audience |
| File Uploads | ✅ Complete | Multi-file, type validation |
| Email Notifications | ✅ Complete | SMTP integration |
| PDF Reports | ✅ Complete | Student report cards |
| Excel Reports | ✅ Complete | Class & attendance reports |
| Audit Logging | ✅ Complete | Track all actions |
| Role-Based Access | ✅ Complete | Secure endpoints |

---

*Built with ❤️ for ILM Possible Education*
*Last Updated: November 1, 2025*

