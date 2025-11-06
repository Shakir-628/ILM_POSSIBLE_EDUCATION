# Installation Fix Guide

## ✅ Dependency Conflicts Fixed!

The peer dependency conflicts have been resolved. The package.json now includes:
- ✅ `react-native-svg`: `13.9.0` (compatible with Expo 49)
- ✅ `react-native-qrcode-svg`: `^6.2.0` (for QR codes)
- ✅ `react-native-calendars`: `^1.1300.0` (for calendar view)

## 🔧 Current Status

The dependencies are configured correctly. You just need to **install when network is stable**.

## Installation Steps

### Option 1: Normal Install (Recommended)
```bash
cd mobile-app
npm install
```

### Option 2: If Still Having Issues
```bash
cd mobile-app
rm -rf node_modules package-lock.json
npm install
```

### Option 3: Force Install
```bash
cd mobile-app
npm install --legacy-peer-deps
```

## Verify Installation

After installation succeeds, verify with:
```bash
npm list react-native-svg
npm list react-native-qrcode-svg
npm list react-native-calendars
```

Expected output:
- react-native-svg@13.9.0
- react-native-qrcode-svg@6.1.0
- react-native-calendars@1.1300.x

## If Installation Still Fails

### Windows PowerShell:
```powershell
cd mobile-app
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install
```

### Mac/Linux:
```bash
cd mobile-app
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## Network Issues During Install

If you see `ECONNRESET` or network errors:

1. **Check your internet connection**
2. **Try a different npm registry:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm install
   ```
3. **Wait and retry** - Sometimes npm servers are busy
4. **Use a VPN** if registry is blocked in your region

## Alternative: Use Yarn

If npm continues to have issues, try yarn:

```bash
# Install yarn globally
npm install -g yarn

# Install dependencies
cd mobile-app
yarn install
```

## Start the App After Installation

```bash
# Make sure backend is running first
cd ../server
npm start

# In another terminal
cd mobile-app
npm start
```

## Verification Checklist

After successful installation:

- [ ] No error messages in terminal
- [ ] `node_modules` folder exists
- [ ] `package-lock.json` created
- [ ] Run `npm start` - Metro bundler starts
- [ ] QR code appears in terminal
- [ ] Can scan with Expo Go app

## Still Having Problems?

**Contact Developer:**
- Email: mshakir628@gmail.com
- Phone: 0323-2207839
- WhatsApp: +92 343 346 3246

**Common Issues:**
1. **Antivirus blocking npm** - Temporarily disable
2. **Firewall blocking** - Allow Node.js through firewall
3. **Insufficient permissions** - Run terminal as Administrator
4. **Corrupted npm cache** - Run `npm cache clean --force`
5. **Old Node.js version** - Update to v16 or later

## Success!

Once installation completes without errors, you're ready to run the app! 🎉

Follow the steps in [QUICK_START.md](QUICK_START.md) to launch your mobile app.

