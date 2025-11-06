# Deployment Guide

## Building the Mobile App for Production

### Prerequisites
- Expo account (create at https://expo.dev)
- EAS CLI installed (`npm install -g eas-cli`)
- Android/iOS certificates (for standalone builds)

## Option 1: Expo Go (Development/Testing)

### Pros:
- Quick testing
- No build required
- Easy updates

### Cons:
- Requires Expo Go app
- Limited native modules
- Not for production

### Steps:
```bash
# Start development server
npm start

# Scan QR code with Expo Go app
# Available on Google Play & App Store
```

---

## Option 2: EAS Build (Recommended for Production)

### Setup EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure
```

### Android Build

#### 1. Development Build (APK)
```bash
# Build APK for testing
eas build --platform android --profile development
```

#### 2. Preview Build (Internal Testing)
```bash
# Build APK for internal distribution
eas build --platform android --profile preview
```

#### 3. Production Build (Play Store)
```bash
# Build AAB for Google Play Store
eas build --platform android --profile production
```

### iOS Build

#### 1. Development Build
```bash
eas build --platform ios --profile development
```

#### 2. Preview Build (TestFlight)
```bash
eas build --platform ios --profile preview
```

#### 3. Production Build (App Store)
```bash
eas build --platform ios --profile production
```

### Build Profiles (eas.json)

Create `eas.json` in project root:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildType": "archive"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./android-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

---

## Option 3: Standalone Build (Manual)

### Android APK

```bash
# Eject from Expo
expo prebuild

# Generate Android APK
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### iOS IPA

```bash
# Eject from Expo
expo prebuild

# Open Xcode
cd ios
open IlmPossibleEducation.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device" as target
# 2. Product > Archive
# 3. Distribute App > Ad Hoc / App Store
```

---

## Publishing to App Stores

### Google Play Store

#### 1. Prepare Store Listing
- App name: ILM Possible Education
- Short description: School Management System
- Full description: Include features, screenshots
- Graphics: Icon (512x512), Feature graphic (1024x500)
- Screenshots: At least 2 (phone and tablet)

#### 2. Create App on Play Console
1. Go to https://play.google.com/console
2. Create new app
3. Fill in app details
4. Set up store listing

#### 3. Upload Build
```bash
# Submit automatically with EAS
eas submit --platform android

# Or upload manually:
# Play Console > Production > Create new release > Upload AAB
```

#### 4. Content Rating
- Complete questionnaire
- Get rating certificate

#### 5. Release
- Choose release type (Internal/Closed/Open testing or Production)
- Review and rollout

### Apple App Store

#### 1. Apple Developer Account
- Enroll at https://developer.apple.com ($99/year)
- Create App ID
- Generate certificates and provisioning profiles

#### 2. App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Fill in app information
4. Add screenshots (required sizes for all devices)
5. Add app icon (1024x1024)

#### 3. Upload Build
```bash
# Submit with EAS
eas submit --platform ios

# Or upload manually via Xcode
# Xcode > Window > Organizer > Upload to App Store
```

#### 4. TestFlight (Optional)
- Add internal testers
- Add external testers
- Distribute beta builds

#### 5. Submit for Review
- Complete all app information
- Add privacy policy URL
- Submit for review
- Wait for approval (usually 1-3 days)

---

## OTA (Over-The-Air) Updates

### Configure app.json
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

### Publish Update
```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"

# View updates
eas update:list
```

### Benefits:
- Instant updates without app store review
- Bug fixes pushed immediately
- A/B testing support
- Rollback capability

### Limitations:
- Only updates JavaScript code
- Cannot update native code
- Requires internet connection

---

## Environment Configuration

### Production API URL

Update `src/services/api.js`:

```javascript
const API_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Development
  : 'https://your-production-api.com/api';  // Production
```

### Use Environment Variables

1. Install expo-constants:
```bash
npx expo install expo-constants
```

2. Create `app.config.js`:
```javascript
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL || 'https://api.ilmpossible.com/api',
    },
  },
};
```

3. Use in code:
```javascript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.apiUrl;
```

---

## Backend Deployment

Before deploying mobile app, ensure backend is deployed:

### Recommended Platforms:
1. **Heroku** (Free tier available)
2. **Railway** (Easy deployment)
3. **Render** (Free tier)
4. **DigitalOcean** (App Platform)
5. **AWS** (Elastic Beanstalk)

### Quick Heroku Deploy:
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Navigate to server directory
cd server

# Create Heroku app
heroku create ilm-possible-api

# Add MongoDB
heroku addons:create mongolab:sandbox

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## Security Checklist

Before production deployment:

- [ ] Change all default credentials
- [ ] Enable HTTPS for API
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable error tracking (Sentry)
- [ ] Implement proper authentication
- [ ] Secure API keys
- [ ] Enable app signing
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Implement data encryption
- [ ] Add crash reporting
- [ ] Enable app obfuscation

---

## Monitoring and Analytics

### Recommended Tools:

1. **Expo Application Services**
   - Built-in crash reporting
   - Update analytics
   - Build logs

2. **Sentry** (Error Tracking)
```bash
npm install @sentry/react-native
```

3. **Google Analytics / Firebase**
```bash
npx expo install expo-firebase-analytics
```

4. **App Center**
   - Crash reporting
   - Analytics
   - Distribution

---

## Post-Deployment

### Marketing
1. Create landing page
2. Add App Store badges
3. Share on social media
4. Create demo video
5. Write blog post

### Maintenance
1. Monitor crash reports
2. Respond to reviews
3. Regular updates
4. Security patches
5. Feature additions

### App Store Optimization (ASO)
1. Optimize app title and description
2. Use relevant keywords
3. Update screenshots regularly
4. Respond to user reviews
5. Encourage positive reviews

---

## Contact

**Developer:** Muhammad Shakir  
**Email:** mshakir628@gmail.com  
**Phone:** 0323-2207839  
**WhatsApp:** +92 343 346 3246  
**Location:** Malir, Karachi

---

## Useful Links

- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- React Native: https://reactnative.dev
- Play Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com

