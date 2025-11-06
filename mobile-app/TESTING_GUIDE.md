# 🧪 Mobile App Testing Guide

## Quick Testing Checklist for All Roles

---

## 🔧 Pre-Test Setup

### 1. **Start Backend Server**
```bash
cd server
npm start
```
✅ Should show: `Server running on port 5000`

### 2. **Start Mobile App**
```bash
cd mobile-app
npm run web
```
✅ Browser should open at `http://localhost:19006`

### 3. **Update API URL** (if needed)
- File: `mobile-app/src/services/api.js`
- Line 4: `const API_URL = 'http://localhost:5000/api';`

---

## 👨‍💼 Admin Testing

### **Credentials:**
```
Email: admin@ilmpossible.com
Password: admin123
```

### **Test Checklist:**

**Dashboard:**
- [ ] Login redirects to dashboard
- [ ] Logout button appears in top right
- [ ] Real student count displays (not "500" hardcoded)
- [ ] Active students count shows
- [ ] Recent students appear (max 5)
- [ ] Click "Manage Students" → Goes to students list
- [ ] Click "View All →" → Goes to students list
- [ ] Click "Announcements" → Goes to announcements
- [ ] Pull down to refresh → Data reloads

**Students List:**
- [ ] Back button appears in header
- [ ] All students from database shown
- [ ] Search bar works (try typing a name)
- [ ] Student cards show: avatar, name, ID, class, status
- [ ] Status badge color: Green (active) / Red (inactive)
- [ ] Pull down to refresh → Data reloads

**Announcements:**
- [ ] Back button appears
- [ ] All announcements shown
- [ ] Priority badges color-coded (Urgent=Red, High=Orange, etc.)
- [ ] Date formatted correctly
- [ ] Target audience displays
- [ ] Author name shows
- [ ] Pull down to refresh

**Profile:**
- [ ] Avatar with first letter shows
- [ ] Name and role display
- [ ] Personal info (email, phone, address)
- [ ] Account info (user ID, role, join date)
- [ ] System info (platform, app version)
- [ ] Quick Actions work:
  - [ ] Settings → Opens settings screen
  - [ ] Help & Support → Opens help screen
  - [ ] Privacy Policy → Opens policy
  - [ ] About App → Opens about
- [ ] Logout button works

**Settings Screen:**
- [ ] Back button works
- [ ] Notification toggles work
- [ ] Dark mode toggle works
- [ ] Auto sync toggle works
- [ ] Biometric toggle works
- [ ] Clear cache shows toast
- [ ] Change password shows toast

**Help & Support:**
- [ ] Phone number is clickable
- [ ] WhatsApp is clickable
- [ ] Email is clickable
- [ ] Address shows on click
- [ ] FAQs expand/collapse
- [ ] Quick links present

**Privacy Policy:**
- [ ] Back button works
- [ ] All 9 sections display
- [ ] Formatted properly
- [ ] Scrollable

**About App:**
- [ ] Back button works
- [ ] App name and version show
- [ ] Key features list (6 items)
- [ ] Tech stack shows
- [ ] Developer info displays
- [ ] Contact info is clickable

---

## 👨‍🎓 Student Testing

### **Credentials:**
```
Email: student@test.com
Password: password123
```

### **Test Checklist:**

**Dashboard:**
- [ ] Login successful
- [ ] Logout button in top right
- [ ] Attendance % shows (calculated from records)
- [ ] Pending assignments count (real data)
- [ ] Average grade shows (calculated)
- [ ] Pending fees amount
- [ ] Today's classes display
- [ ] Recent announcements show (max 3)
- [ ] Pull to refresh works
- [ ] Click logout → Confirmation → Logs out

**Attendance:**
- [ ] Calendar displays
- [ ] Dates marked with dots
- [ ] Green = Present, Red = Absent
- [ ] Stats show: Attendance %, Present days, Absent days, Total
- [ ] Pull to refresh

**Timetable:**
- [ ] Today's classes show
- [ ] Subject, teacher, time, room display
- [ ] Color-coded by subject
- [ ] Period duration shows
- [ ] Pull to refresh

**Assignments:**
- [ ] All assignments list
- [ ] Filter tabs work (All/Pending/Submitted/Graded)
- [ ] Due date shows
- [ ] Status badges display
- [ ] Subject info present
- [ ] Pull to refresh

**Grades:**
- [ ] All subjects listed
- [ ] Marks obtained / Total marks
- [ ] Percentage calculation
- [ ] Grade display
- [ ] Pull to refresh

**Profile:**
- [ ] Personal info displays
- [ ] Academic info shows
- [ ] QR code ID card generates
- [ ] Logout works

---

## 👨‍🏫 Teacher Testing

### **Credentials:**
```
Email: teacher@test.com
Password: password123
```

### **Test Checklist:**

**Dashboard:**
- [ ] Login successful
- [ ] Logout button in top right
- [ ] My classes count shows
- [ ] Total students count
- [ ] Pending grades count
- [ ] Today's periods count
- [ ] Recent announcements display (max 3)
- [ ] Quick actions work
- [ ] Pull to refresh
- [ ] Logout works

**Mark Attendance:**
- [ ] Screen loads (placeholder)

**Grade Entry:**
- [ ] Screen loads (placeholder)

**Profile:**
- [ ] Personal info displays
- [ ] Logout works

---

## 👨‍👩‍👧‍👦 Parent Testing

### **Credentials:**
```
Email: parent@test.com
Password: password123
```

### **Test Checklist:**

**Dashboard:**
- [ ] Login successful
- [ ] Logout button in top right
- [ ] Children count shows (from database)
- [ ] Average attendance calculated
- [ ] Average grades calculated
- [ ] Total pending fees summed
- [ ] Children cards display
- [ ] Click child → Goes to child details
- [ ] Quick actions work
- [ ] Pull to refresh
- [ ] Logout works

**Children List:**
- [ ] All children display
- [ ] StudentCard component used
- [ ] Click child → Child details screen
- [ ] Help card shows
- [ ] Pull to refresh

**Child Details:**
- [ ] Back button works
- [ ] Child name in header
- [ ] Student ID and class show
- [ ] Statistics display (attendance, grades, assignments, fees)
- [ ] Quick access buttons present
- [ ] Student information complete
- [ ] Status badge shows
- [ ] Pull to refresh

**Fees Management:**
- [ ] Summary card shows total pending & paid
- [ ] Each child has fee card
- [ ] Pending amount per child
- [ ] Paid amount per child
- [ ] Total amount per child
- [ ] "Pay Now" button appears if pending > 0
- [ ] Info card explains payment methods
- [ ] Pull to refresh

**Profile:**
- [ ] Personal info displays
- [ ] Logout works

---

## 🎨 Design System Testing

### **Visual Consistency:**
- [ ] All headers have purple gradient
- [ ] All cards have same border radius (12px)
- [ ] All avatars are circles with first letter
- [ ] All status badges use same style
- [ ] All buttons have consistent design
- [ ] All text uses consistent sizes
- [ ] All spacing is uniform

### **Color Coding:**
- [ ] Status: Green (active), Red (inactive), Orange (pending)
- [ ] Priority: Red (urgent), Orange (high), Blue (medium), Green (low)
- [ ] Roles: Purple (admin), Green (teacher), Blue (student), Purple (parent)

### **Interactions:**
- [ ] All cards have subtle shadows
- [ ] Touchable elements respond to press
- [ ] Loading spinners appear during data fetch
- [ ] Toast notifications show for actions
- [ ] Pull-to-refresh works everywhere
- [ ] Empty states show when no data
- [ ] Error messages display clearly

---

## 🔄 Common Test Scenarios

### **Scenario 1: Fresh Login**
1. Clear browser storage (F12 → Application → Clear)
2. Refresh page
3. Login with any role
4. Should see appropriate dashboard
5. Logout button should appear

### **Scenario 2: Data Refresh**
1. On any dashboard
2. Pull down to refresh
3. Loading indicator appears
4. Data reloads from server
5. Updated counts display

### **Scenario 3: Navigation**
1. From dashboard, tap a card/button
2. New screen opens
3. Back button appears (where applicable)
4. Tap back → Returns to dashboard
5. Logout → Confirmation → Login screen

### **Scenario 4: Search (Admin)**
1. Go to Students List
2. Type in search box
3. Results filter in real-time
4. Clear search → All students return

### **Scenario 5: Parent Multi-Child**
1. Login as parent
2. Dashboard shows all children
3. Stats are averaged/summed
4. Click child → Individual stats shown
5. Go to Fees → Each child's fees listed separately

---

## ⚠️ Known Behaviors

### **Expected:**
- First data load may take 2-3 seconds
- Web reload after login (by design)
- Logout requires confirmation (by design)
- Some teacher features show placeholders
- Payment gateway shows "coming soon"

### **Backend Required:**
- Student, teacher, announcement data must exist
- Parent account must have linked children
- Fees, attendance, grades must be created
- Classes must be set up

---

## 🐛 If Something Doesn't Work

### **No Data Showing:**
1. Check backend is running (`npm start` in server folder)
2. Check API URL in `src/services/api.js`
3. Check browser console for errors (F12)
4. Verify database has data

### **Login Doesn't Redirect:**
1. Check console for errors
2. Verify API response has `token` and user data
3. Clear browser storage and try again
4. Refresh page after login

### **Cannot Navigate Back:**
1. Verify back button is visible
2. Check browser console for navigation errors
3. Use browser back button as fallback

### **Parent Sees No Children:**
1. Check if parent account has linked students
2. Verify `/api/parents/my-children` endpoint
3. May show empty state (expected if no links)

---

## ✅ Success Criteria

A successful test means:

✅ **All 4 roles login successfully**  
✅ **Dashboards show real data (not hardcoded)**  
✅ **Navigation works smoothly**  
✅ **Search finds students**  
✅ **Logout requires confirmation**  
✅ **Pull-to-refresh reloads data**  
✅ **Parent sees their children**  
✅ **Design is consistent**  
✅ **No console errors**  
✅ **All buttons functional**  

---

## 🎯 Quick Test Commands

```bash
# Test Admin
- Login: admin@ilmpossible.com / admin123
- Check: Real student count, search, announcements

# Test Student  
- Login: student@test.com / password123
- Check: Attendance %, grades, timetable, assignments

# Test Teacher
- Login: teacher@test.com / password123
- Check: Dashboard stats, announcements

# Test Parent
- Login: parent@test.com / password123
- Check: Children list, fees, child details
```

---

## 📊 Performance Benchmarks

**Expected Load Times:**
- Login: < 2 seconds
- Dashboard: < 3 seconds
- Data refresh: < 2 seconds
- Search: Instant (local filter)
- Navigation: < 1 second

---

**Happy Testing! 🚀**

For issues or questions:
- 📧 mshakir628@gmail.com
- 📱 +92 323 220 7839

