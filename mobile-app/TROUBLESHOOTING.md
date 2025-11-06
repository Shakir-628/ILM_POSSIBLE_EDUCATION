# Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### Issue: `npm install` fails
**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Issue: Expo CLI not found
**Solution:**
```bash
npm install -g expo-cli
# or use npx
npx expo start
```

### Runtime Issues

#### Issue: "Network Error" when logging in
**Possible Causes & Solutions:**

1. **Backend not running**
   ```bash
   # Navigate to server directory and start backend
   cd ../server
   npm start
   ```

2. **Wrong API URL**
   - Check `src/services/api.js`
   - For Android Emulator: use `http://10.0.2.2:5000/api`
   - For Physical Device: use your computer's IP `http://192.168.1.x:5000/api`
   - For iOS Simulator: use `http://localhost:5000/api`

3. **Firewall blocking connections**
   - Allow Node.js through Windows Firewall
   - Disable antivirus temporarily to test

#### Issue: "Cannot connect to Metro bundler"
**Solutions:**
```bash
# Clear Metro bundler cache
npx expo start -c

# Reset cache completely
npx expo start --clear
```

#### Issue: White screen after login
**Possible Causes:**
1. Check if user role is correctly set in backend
2. Verify navigation is set up for that role
3. Check console for JavaScript errors

**Solution:**
```bash
# Open debug console
# In Expo Go app, shake device and select "Debug Remote JS"
# Or run with --dev-client flag
```

#### Issue: Images not loading
**Solutions:**
1. Check image URLs are accessible
2. Verify image paths are correct
3. For local images, ensure they're imported correctly
4. Check network permissions in app.json

### Build Issues

#### Issue: Build fails on Android
**Solutions:**
```bash
# Update dependencies
npm update

# Verify Android SDK is installed
# Check ANDROID_HOME environment variable

# Clean build
cd android
./gradlew clean
cd ..
expo prebuild --clean
```

#### Issue: Build fails on iOS
**Solutions:**
```bash
# Clean pod cache
cd ios
pod deintegrate
pod cache clean --all
pod install
cd ..

# Rebuild
expo prebuild --clean
```

### Development Issues

#### Issue: Hot reload not working
**Solutions:**
```bash
# Restart metro bundler
# Press 'r' in terminal to reload
# Or shake device and tap "Reload"

# If still not working:
npx expo start -c
```

#### Issue: Changes not reflecting in app
**Solutions:**
1. Check if you're editing the correct file
2. Ensure file is saved
3. Clear cache and reload
4. Restart Expo development server

### API Issues

#### Issue: 401 Unauthorized errors
**Causes:**
- Token expired
- Invalid token
- Token not being sent

**Solutions:**
1. Logout and login again
2. Check AuthContext token handling
3. Verify token is stored in AsyncStorage
4. Check API headers in api.js

#### Issue: CORS errors
**Note:** Mobile apps don't have CORS issues, but if testing in web:
- Check backend CORS configuration
- Ensure API URL is correct
- Verify backend is accepting requests

### Device-Specific Issues

#### Android Emulator Issues

**Slow performance:**
- Increase RAM allocation in AVD Manager
- Enable Hardware Acceleration
- Use x86 images instead of ARM

**Network not working:**
```bash
# Use 10.0.2.2 instead of localhost
API_URL=http://10.0.2.2:5000/api
```

#### iOS Simulator Issues

**Simulator not starting:**
```bash
# Reset simulator
xcrun simctl erase all

# Restart simulator
# Or use: Simulator > Device > Erase All Content and Settings
```

### Performance Issues

#### App running slow
**Solutions:**
1. Enable Hermes engine (enabled by default in Expo)
2. Reduce unnecessary re-renders
3. Optimize images
4. Use FlatList instead of ScrollView for large lists
5. Implement pagination for API calls

#### Memory issues
**Solutions:**
1. Check for memory leaks
2. Clean up event listeners
3. Cancel pending API requests on unmount
4. Optimize images (compress, lazy load)

## Getting Help

### Useful Commands

```bash
# Check Expo version
npx expo --version

# View logs
npx expo start

# Clear all caches
npx expo start -c

# Run on specific device
npx expo start --android
npx expo start --ios

# View device logs
# Android
adb logcat

# iOS
xcrun simctl spawn booted log stream --predicate 'process == "Expo"'
```

### Debug Tools

1. **React Native Debugger**
   - Download from GitHub
   - Connect to Metro bundler
   - View Redux state, network requests, console logs

2. **Expo Dev Tools**
   - Opens automatically with `expo start`
   - View logs, run on devices, scan QR code

3. **Flipper**
   - Advanced debugging tool
   - Network inspector, logs, layout inspector

### Log Collection

**Enable verbose logging:**
```javascript
// Add to App.js temporarily
if (__DEV__) {
  console.log = (...args) => {
    console.info(...args);
  };
}
```

**Check AsyncStorage:**
```javascript
// In any component
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.getAllKeys().then(keys => {
  console.log('All keys:', keys);
  AsyncStorage.multiGet(keys).then(data => {
    console.log('All data:', data);
  });
});
```

## Contact Support

If issues persist:
1. Check GitHub Issues
2. Review Expo documentation
3. Contact developer: mshakir628@gmail.com
4. WhatsApp: +92 343 346 3246

