# Notification System Implementation Guide

## Overview
The Education Management System now includes a comprehensive real-time notification system that alerts admins about:
- **Late Fees**: Students with overdue or unpaid fees
- **Upcoming Events**: Events scheduled within 7 days
- **Upcoming Exams**: Exams scheduled within 7 days
- **System Alerts**: Custom alerts and announcements

## Architecture

### Frontend Components

#### NotificationBell Component
Located at: `client/src/components/NotificationBell.js`

**Features:**
- Displays notification bell icon with badge count
- Dropdown menu showing recent notifications (10 most recent)
- Real-time updates via Socket.IO
- Mark as read / Delete functionality
- Mark all as read option
- Time formatting (e.g., "5m ago", "2h ago")
- Type-based emoji indicators (💰 Fee, 📅 Event, 📝 Exam, etc.)

**Integration:**
- Automatically integrated into Navbar component
- Requires authentication token from AuthContext

**Socket.IO Listeners:**
- `notification:new` - Receives new notifications in real-time
- `notification:updated` - Listens for notification list updates

### Backend Services

#### 1. Admin Notification Service
Location: `server/services/adminNotificationService.js`

**Key Functions:**
- `getLateFees()` - Fetches students with overdue fees
- `getUpcomingEvents()` - Fetches events within 7 days
- `getUpcomingExams()` - Fetches exams within 7 days
- `createAdminNotifications(adminId)` - Creates notifications for a specific admin
- `refreshAdminNotifications()` - Refreshes all admin notifications

**Usage Example:**
```javascript
import { refreshAdminNotifications } from '../services/adminNotificationService.js';

// Refresh all admin notifications
const results = await refreshAdminNotifications();
```

#### 2. Notification Emitter
Location: `server/utils/notificationEmitter.js`

**Key Functions:**
- `emitNotificationToUser(userId, notification)` - Emit to specific user
- `emitNotificationToAdmins(notification)` - Emit to all admins
- `createAndEmitNotification(notificationData)` - Create and emit in one step
- `createAndEmitBulkNotifications(recipients, notificationData)` - Bulk emission
- `broadcastNotificationUpdate()` - Broadcast update to all connected clients

**Usage Example:**
```javascript
import { createAndEmitNotification } from '../utils/notificationEmitter.js';

// Create and emit a notification
const notification = await createAndEmitNotification({
  recipient: adminId,
  title: 'Late Fee Alert',
  message: 'Student has an overdue fee',
  type: 'fee',
  link: '/accounting/fees'
});
```

#### 3. Notification Helpers
Location: `server/utils/notificationHelpers.js`

**Pre-built Helper Functions:**
- `createLateFeeNotification(adminId, studentData, feeData)`
- `createUpcomingEventNotification(adminId, eventData)`
- `createUpcomingExamNotification(adminId, examData, scheduleData)`
- `createAnnouncementNotification(recipientId, announcementData)`
- `createAssignmentNotification(recipientId, assignmentData, submissionData)`
- `createGradeNotification(studentParentId, gradeData, subjectName)`
- `createAttendanceNotification(studentParentId, attendanceData, date)`

### Backend API Endpoints

#### GET `/api/notifications/unread/count`
Get count of unread notifications for current user
```javascript
Response: { success: true, count: 5 }
```

#### GET `/api/notifications`
Get notifications for current user
```javascript
Query Parameters:
- read: boolean (filter by read status)
- type: string (filter by type: fee, exam, event, etc.)
- limit: number (default: 50)

Response: { success: true, count: 10, data: [...] }
```

#### PUT `/api/notifications/:id/read`
Mark notification as read
```javascript
Response: { success: true, data: { ...notification, read: true } }
```

#### PUT `/api/notifications/read-all`
Mark all notifications as read
```javascript
Response: { success: true, message: "..." }
```

#### POST `/api/notifications`
Create a notification (Admin only)
```javascript
Body: {
  recipient: userId,
  title: string,
  message: string,
  type: 'fee' | 'exam' | 'event' | 'announcement' | 'warning' | 'info',
  link: string (optional),
  actionText: string (optional)
}

Response: { success: true, data: {...notification} }
```

#### POST `/api/notifications/bulk`
Create bulk notifications (Admin only)
```javascript
Body: {
  recipients: [userId1, userId2, ...],
  title: string,
  message: string,
  type: string,
  link: string (optional)
}

Response: { success: true, count: 5 }
```

#### GET `/api/notifications/admin/summary`
Get admin notification summary (late fees, upcoming events, exams)
```javascript
Response: {
  success: true,
  data: {
    lateFees: { count: 3, totalAmount: 50000, details: [...] },
    upcomingEvents: { count: 2, details: [...] },
    upcomingExams: { count: 1, details: [...] }
  }
}
```

#### POST `/api/notifications/admin/refresh`
Manually refresh admin notifications
```javascript
Response: {
  success: true,
  data: [
    { adminId: "...", adminName: "...", notificationsCreated: 3 }
  ]
}
```

#### DELETE `/api/notifications/:id`
Delete a notification
```javascript
Response: { success: true, message: "Notification deleted successfully" }
```

## Usage Guide

### 1. Displaying Notifications in Admin Dashboard
The NotificationBell component is already integrated into the Navbar and will appear automatically.

### 2. Creating Notifications from Controllers

**Example: Fee Controller**
```javascript
import { createLateFeeNotification } from '../utils/notificationHelpers.js';
import User from '../models/User.js';

// In your fee payment controller
export const updateFeePaymentStatus = async (req, res) => {
  try {
    // ... update fee logic ...
    
    // If marked as overdue, notify admin
    if (feePayment.status === 'overdue') {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        await createLateFeeNotification(
          admin._id,
          student,
          feePayment
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    // ... error handling ...
  }
};
```

**Example: Event Controller**
```javascript
import { createUpcomingEventNotification } from '../utils/notificationHelpers.js';
import User from '../models/User.js';

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    
    // Notify admin about upcoming event
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await createUpcomingEventNotification(admin._id, event);
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    // ... error handling ...
  }
};
```

### 3. Setting Up Scheduled Notifications
For periodic notification refreshes, set up a cron job:

```javascript
// In server.js or a separate cron service
import cron from 'node-cron';
import { refreshAdminNotifications } from './services/adminNotificationService.js';

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('🔄 Running scheduled notification refresh...');
  try {
    await refreshAdminNotifications();
    console.log('✅ Notification refresh completed');
  } catch (error) {
    console.error('❌ Error in scheduled notification refresh:', error);
  }
});
```

### 4. Real-time Socket.IO Updates
The system automatically broadcasts notifications via Socket.IO when:
- Notifications are created via API
- Admin notifications are refreshed
- Any fee, event, or exam is created/updated

The NotificationBell component listens for:
- `notification:new` event - Updates count and list in real-time
- `notification:updated` event - Refreshes the notification list

## Notification Types

| Type | Icon | Use Case |
|------|------|----------|
| `fee` | 💰 | Late/overdue fee alerts |
| `exam` | 📝 | Upcoming exam reminders |
| `event` | 📅 | Upcoming event notifications |
| `assignment` | 📋 | Assignment submissions |
| `message` | 💬 | Messages and communications |
| `warning` | ⚠️ | System warnings and alerts |
| `success` | ✅ | Success confirmations |
| `error` | ❌ | Error alerts |
| `announcement` | 📢 | School announcements |
| `attendance` | 📍 | Attendance records |
| `info` | ℹ️ | General information |

## Database Model

**Notification Schema**
```javascript
{
  recipient: ObjectId (ref: User),  // User receiving notification
  title: String,                     // Notification title
  message: String,                   // Detailed message
  type: String (enum),               // notification type
  read: Boolean (default: false),    // Read status
  readAt: Date,                      // When marked as read
  link: String,                      // Navigation link
  actionText: String,                // CTA button text
  relatedEntity: String,             // Type of related entity
  relatedEntityId: ObjectId,         // ID of related entity
  createdAt: Date,                   // Created timestamp
  updatedAt: Date                    // Updated timestamp
}
```

## Future Enhancements

1. **Notification Preferences**: Allow users to choose which notifications they want to receive
2. **Email Notifications**: Send important notifications via email as well
3. **SMS Notifications**: Integration with SMS provider for critical alerts
4. **Notification Groups**: Group similar notifications (e.g., all late fees together)
5. **Read Receipts**: Track when notifications are read by multiple recipients
6. **Scheduled Notifications**: Schedule notifications to be sent at specific times
7. **Notification Templates**: Create reusable notification templates
8. **Notification Analytics**: Track notification engagement and effectiveness

## Troubleshooting

### Notifications Not Appearing
1. Check Socket.IO connection: Open browser dev tools → Console
2. Verify authentication token is valid
3. Check browser console for connection errors
4. Ensure backend is running and Socket.IO is initialized

### Notifications Not Persisting
1. Check MongoDB connection
2. Verify Notification model is properly defined
3. Check database permissions

### Real-time Updates Not Working
1. Verify Socket.IO is initialized in server.js
2. Check CORS settings in Socket.IO configuration
3. Ensure client is connecting with valid authentication token
4. Check network tab in browser dev tools for WebSocket connection

## Support
For issues or questions, contact the development team.
