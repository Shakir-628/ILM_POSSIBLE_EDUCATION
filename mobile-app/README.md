# ILM Possible Education - Mobile App

A comprehensive School Management System mobile application built with React Native and Expo.

## 📱 Features

### For Students
- **Dashboard**: Overview of attendance, assignments, grades, and fees
- **Attendance**: View attendance history and statistics with calendar view
- **Timetable**: Daily class schedule with teacher and room information
- **Assignments**: View, filter (pending/submitted), and track assignments
- **Grades**: Subject-wise grades with percentage calculations
- **Fees**: View fee structure and payment status
- **Digital ID Card**: QR code-based student identification

### For Teachers
- **Dashboard**: Overview of classes, students, and schedule
- **Mark Attendance**: Quick attendance marking interface
- **Grade Entry**: Enter and manage student grades
- **Profile**: Teacher information and settings

### For Parents
- **Dashboard**: Overview of children's academic performance
- **Children**: View all enrolled children
- **Performance**: Track children's academic progress
- **Fees**: View and manage fee payments

### For Administrators
- **Dashboard**: System-wide statistics and overview
- **Students**: Student management (use web app for full features)
- **Announcements**: Create and manage announcements
- **Profile**: Admin settings

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **API Client**: Axios
- **UI Components**: Custom components with React Native primitives
- **Icons**: Expo Vector Icons (Ionicons)
- **Gradients**: expo-linear-gradient
- **Calendar**: react-native-calendars
- **QR Codes**: react-native-qrcode-svg
- **Storage**: AsyncStorage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio (for Android Emulator)
- Expo Go app on your physical device (optional)

## 🚀 Installation

1. **Navigate to the mobile app directory**:
```bash
cd mobile-app
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment configuration**:
Create a `.env` file in the root of the mobile-app directory:
```env
API_BASE_URL=http://192.168.1.100:5000/api
# Replace with your computer's IP address if testing on physical device
# Use localhost if testing on emulator/simulator
```

4. **Update API URL in the code** (if needed):
Edit `mobile-app/src/services/api.js` and update the `baseURL` to match your backend server URL.

## 🏃 Running the App

### Start the development server:
```bash
npm start
# or
expo start
```

### Run on iOS Simulator (Mac only):
```bash
npm run ios
```

### Run on Android Emulator:
```bash
npm run android
```

### Run on Physical Device:
1. Install Expo Go from App Store or Google Play
2. Scan the QR code shown in the terminal
3. The app will load on your device

## 📁 Project Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CustomButton.js
│   │   ├── CustomCard.js
│   │   ├── CustomInput.js
│   │   ├── StatCard.js
│   │   ├── Loading.js
│   │   └── EmptyState.js
│   ├── context/            # React Context providers
│   │   ├── AuthContext.js
│   │   └── ToastContext.js
│   ├── navigation/         # Navigation structure
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   ├── StudentNavigator.js
│   │   ├── TeacherNavigator.js
│   │   ├── ParentNavigator.js
│   │   └── AdminNavigator.js
│   ├── screens/           # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── student/       # Student screens
│   │   ├── teacher/       # Teacher screens
│   │   ├── parent/        # Parent screens
│   │   └── admin/         # Admin screens
│   ├── services/          # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── studentService.js
│   │   ├── attendanceService.js
│   │   ├── assignmentService.js
│   │   ├── gradeService.js
│   │   ├── feeService.js
│   │   ├── timetableService.js
│   │   └── announcementService.js
│   └── utils/             # Utility files
│       ├── theme.js
│       ├── constants.js
│       └── storage.js
├── App.js                 # Root component
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## 🔐 Authentication

The app uses JWT-based authentication. Users can:
- Login with email and password
- Register new accounts
- Reset forgotten passwords

Credentials are stored securely using AsyncStorage.

## 🎨 UI/UX Features

- **Theme**: Modern gradient-based design
- **Colors**: Indigo and purple primary colors
- **Animations**: Smooth transitions and loading states
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Proper labels and touch targets

## 📡 API Integration

The mobile app connects to the same backend as the web application. Ensure your backend server is running before using the app.

**Backend Requirements**:
- Node.js backend running on port 5000
- MongoDB database connected
- All API endpoints accessible

**Testing with Physical Device**:
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` (look for inet)
2. Update `API_BASE_URL` to use your IP address
3. Ensure your phone and computer are on the same WiFi network
4. Make sure your firewall allows connections on port 5000

## 🔔 Push Notifications (Coming Soon)

Push notification support is planned for future releases. It will include:
- Expo Notifications integration
- Assignment due date reminders
- Announcement notifications
- Fee payment reminders

## 🐛 Troubleshooting

### Common Issues

**1. "Unable to connect to server"**
- Verify backend server is running
- Check API_BASE_URL is correct
- Ensure no firewall blocking connections
- Test API endpoint in browser first

**2. "Network request failed"**
- Check internet connectivity
- Verify device/emulator can reach backend
- Try using IP address instead of localhost

**3. "Metro bundler issues"**
- Clear cache: `expo start -c`
- Delete node_modules: `rm -rf node_modules && npm install`
- Reset Metro: `npx react-native start --reset-cache`

**4. "Build errors"**
- Ensure all dependencies are installed
- Check Node.js version compatibility
- Try cleaning build: `expo prebuild --clean`

## 📱 Testing

### Test Accounts
Use these credentials to test different user roles:

**Student**:
- Email: student@ilmpossible.edu
- Password: Student@123

**Teacher**:
- Email: teacher@ilmpossible.edu
- Password: Teacher@123

**Parent**:
- Email: parent@ilmpossible.edu
- Password: Parent@123

**Admin**:
- Email: admin@ilmpossible.edu
- Password: Admin@123

## 🚢 Building for Production

### Android APK
```bash
expo build:android
# or for EAS Build
eas build --platform android
```

### iOS IPA (requires Apple Developer account)
```bash
expo build:ios
# or for EAS Build
eas build --platform ios
```

### App Store Deployment
1. Configure app.json with proper identifiers
2. Generate app icons and splash screens
3. Build production bundles
4. Submit to respective app stores

## 📚 Dependencies

Key dependencies used in this project:

```json
{
  "expo": "~50.0.0",
  "react-native": "0.73.0",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/drawer": "^6.6.6",
  "axios": "^1.6.2",
  "react-native-calendars": "^1.1304.1",
  "react-native-qrcode-svg": "^6.2.0",
  "expo-linear-gradient": "~13.0.2",
  "@react-native-async-storage/async-storage": "1.21.0"
}
```

## 🤝 Contributing

This is a private educational project. For any issues or suggestions:
1. Document the issue clearly
2. Provide steps to reproduce
3. Include screenshots if applicable
4. Contact the development team

## 📄 License

This project is proprietary and confidential.
© 2025 ILM Possible Education. All rights reserved.

## 👥 Contact

**ILM Possible Education**
- Email: mshakir628@gmail.com
- Phone: 0323-2207839, 03433463246
- WhatsApp: +92 343 3463246
- Address: Malir, Karachi

## 🎯 Roadmap

### Upcoming Features
- [ ] Offline mode with local caching
- [ ] Push notifications for assignments and announcements
- [ ] Biometric authentication (Face ID/Touch ID)
- [ ] In-app chat for teacher-parent communication
- [ ] Document viewer for assignments and study materials
- [ ] Dark mode support
- [ ] Multi-language support (Urdu, English)
- [ ] Fee payment integration
- [ ] Advanced analytics dashboard
- [ ] Parent-teacher meeting scheduler

### Future Enhancements
- [ ] Video lessons integration
- [ ] Live class support
- [ ] Quiz and assessment module
- [ ] Student performance graphs
- [ ] Transport tracking (GPS)
- [ ] Hostel management features
- [ ] Library book search and reservation
- [ ] Cafeteria menu and ordering

## 📊 Performance

The app is optimized for:
- Fast startup time (< 3 seconds)
- Smooth 60 FPS animations
- Efficient memory usage
- Minimal battery consumption
- Reduced data usage with smart caching

## 🔒 Security

Security measures implemented:
- JWT token-based authentication
- Secure credential storage
- API request encryption
- Input validation and sanitization
- Role-based access control

## 💡 Tips for Developers

1. **Use real device for testing**: Emulators can be slow
2. **Enable Fast Refresh**: Instant feedback on code changes
3. **Use Expo Go for rapid testing**: No need to rebuild
4. **Check network inspector**: Use Flipper or React Native Debugger
5. **Follow component structure**: Keep screens clean, move logic to services
6. **Reuse components**: DRY principle for better maintainability

## 🙏 Acknowledgments

Built with:
- React Native & Expo team for the amazing framework
- React Navigation for seamless navigation
- All open-source contributors

---

**Made with ❤️ for ILM Possible Education**

For technical support or questions, contact the development team.

