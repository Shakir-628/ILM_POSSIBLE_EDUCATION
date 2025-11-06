# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Checklist
- ✅ Node.js installed (v16 or later)
- ✅ npm or yarn installed
- ✅ Expo CLI (`npm install -g expo-cli`)
- ✅ Expo Go app on your phone
- ✅ Backend server running

### Step 1: Install Dependencies
```bash
cd mobile-app
npm install
```

### Step 2: Configure API URL

Edit `src/services/api.js`:

**For Testing on Phone (Same WiFi Network):**
```javascript
const API_URL = 'http://YOUR_COMPUTER_IP:5000/api';
// Example: http://192.168.1.100:5000/api
```

**For Android Emulator:**
```javascript
const API_URL = 'http://10.0.2.2:5000/api';
```

**For iOS Simulator:**
```javascript
const API_URL = 'http://localhost:5000/api';
```

### Step 3: Start Backend Server

```bash
# Open new terminal
cd server
npm start
```

### Step 4: Start Mobile App

```bash
# In mobile-app directory
npm start
```

### Step 5: Open in Expo Go

1. Scan QR code with Expo Go app
   - **iOS**: Use Camera app
   - **Android**: Use Expo Go app

2. Wait for bundling to complete

3. App will open automatically!

---

## 📱 Test Credentials

### Student Login
- **Email:** student@test.com
- **Password:** password123

### Teacher Login
- **Email:** teacher@test.com
- **Password:** password123

### Parent Login
- **Email:** parent@test.com
- **Password:** password123

### Admin Login
- **Email:** admin@ilmpossible.com
- **Password:** admin123

---

## 🔧 Finding Your Computer's IP Address

### Windows:
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter

### Mac/Linux:
```bash
ifconfig
# or
ip addr show
```
Look for "inet" address (usually starts with 192.168.x.x)

---

## ⚡ Quick Commands

### Development
```bash
npm start              # Start development server
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
```

### Clear Cache
```bash
npm start -- --clear   # Clear Metro bundler cache
```

### View Logs
```bash
# In Expo dev tools (browser)
# Or shake device in Expo Go > Show Dev Menu > Debug Remote JS
```

---

## 🐛 Common First-Time Issues

### Issue: "Network Error"
✅ **Solution:** Make sure backend is running on `http://localhost:5000`

### Issue: "Cannot connect to Metro"
✅ **Solution:** 
```bash
npm start -- --clear
# Or restart your terminal
```

### Issue: "Expo Go app shows error"
✅ **Solution:** Update Expo Go app from App Store/Play Store

### Issue: "Module not found"
✅ **Solution:**
```bash
rm -rf node_modules
npm install
```

---

## 📖 Next Steps

1. ✅ App running? Great! Try logging in
2. 📚 Read [README.md](README.md) for full features
3. 🔧 Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) if issues arise
4. 🚀 Ready to deploy? See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🆘 Need Help?

**Developer Contact:**
- **Email:** mshakir628@gmail.com
- **Phone:** 0323-2207839
- **WhatsApp:** +92 343 346 3246

**Documentation:**
- [Full README](README.md)
- [Features List](FEATURES.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Deployment Guide](DEPLOYMENT.md)

---

## 🎉 You're All Set!

Your mobile app should now be running. Explore the features:

- 👨‍🎓 **Students:** Check attendance, view timetable, submit assignments
- 👨‍🏫 **Teachers:** Mark attendance, enter grades, view schedule
- 👨‍👩‍👧‍👦 **Parents:** Monitor children's performance, pay fees
- 👨‍💼 **Admins:** Manage school operations

Happy coding! 🚀

