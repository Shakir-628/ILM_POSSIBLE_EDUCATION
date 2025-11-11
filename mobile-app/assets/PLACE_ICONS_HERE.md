# 📁 Asset Files Required

Place the following PNG files in this directory:

## 🎯 **Required Files:**

### **1. icon.png**
- Size: 1024x1024 pixels
- Purpose: Main app icon for iOS and Android
- Design: Graduation cap on purple gradient background

### **2. splash.png**
- Size: 1242x2436 pixels (or 1284x2778 for newer iPhones)
- Purpose: Native splash screen image
- Design: Full screen splash with logo and branding

### **3. adaptive-icon.png**
- Size: 1024x1024 pixels
- Purpose: Android adaptive icon (foreground layer only)
- Design: Just the graduation cap icon without background

### **4. notification-icon.png**
- Size: 96x96 pixels
- Purpose: Android notification icon
- Design: Simple white icon on transparent background

### **5. favicon.png**
- Size: 48x48 pixels (or 64x64)
- Purpose: Web browser tab icon
- Design: Simplified version of app icon

---

## 🎨 **Design Guidelines:**

**Colors:**
- Primary Purple: #4F46E5
- Secondary Purple: #8B5CF6  
- Accent Pink: #FF4081
- White: #FFFFFF

**Style:**
- Modern and minimalist
- Clean lines
- High contrast
- Professional look

---

## ⚡ **Quick Create with Canva:**

1. Visit canva.com (free)
2. Create custom size (1024x1024)
3. Add purple gradient background
4. Add graduation cap icon (pink #FF4081)
5. Export as PNG
6. Rename to required filename
7. Place in this folder

---

## 🚀 **After Adding Files:**

1. Restart Expo dev server:
   ```bash
   npx expo start -c
   ```

2. The app will use your custom icons and splash screen!

---

## 📝 **Note:**

The **animated splash screen** in the app (`src/screens/SplashScreen.js`) will show **AFTER** the native splash loads. This provides a seamless loading experience:

1. **Native Splash** (instant) → Shows splash.png
2. **React Loads** (1-2 seconds)
3. **Animated Splash** (2.5 seconds) → Custom component with animations
4. **Main App** → Login or Dashboard

Both work together for the best user experience! ✨

