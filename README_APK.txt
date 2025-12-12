
# How to Build Lynix as an Android 14 APK

Since I am an AI, I cannot generate a binary `.apk` file directly. 
However, I have transformed the mobile codebase to behave exactly like a native Android 14 app (Pixel UI, Material You, No Guest Mode).

To turn this into an APK, follow these steps using **CapacitorJS**:

## 1. Initialize Capacitor (Run in terminal)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init Lynix com.lynix.app --web-dir dist
```

## 2. Build the Web App
```bash
npm run build
```

## 3. Add Android Platform
```bash
npx cap add android
```

## 4. Configure Capacitor (capacitor.config.json)
Ensure your config looks like this to hide the splash screen and handle navigation properly:
```json
{
  "appId": "com.lynix.app",
  "appName": "Lynix",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  }
}
```

## 5. Open in Android Studio & Build
```bash
npx cap open android
```
- In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK**.
- This will generate the `app-debug.apk` file.

## Features Included in this Codebase:
- **Mandatory Login**: Guest button hidden on mobile.
- **Pixel Launcher UI**: Replaces the old mobile launcher with an Android 14 style home screen.
- **Material You Apps**: Phone, Chat, Mail, and Contacts are redesigned to look like native Google apps.
- **Help App**: Replaces the floating '?' button.
- **Notification Request**: Automatically asks for push permissions on launch.
