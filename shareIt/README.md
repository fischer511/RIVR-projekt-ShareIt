# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Firebase configuration

This app uses the Firebase Web SDK (Auth, Firestore, Storage). Provide your Web app config via environment variables.

1. Copy `.env.example` to `.env` and fill values from Firebase Console → Project Settings → Your apps → Web (</>) → Config.
2. Ensure `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` ends with `appspot.com` and `EXPO_PUBLIC_FIREBASE_APP_ID` contains `:web:`.
3. Restart Expo to load env:

```bash
npx expo start -c
```

Note: `.env` is gitignored; commit `.env.example`.

## Post-clone setup

1. Install dependencies

   ```bash
   cd shareIt
   npm install
   ```

2. Create and fill environment file

   ```bash
   cp .env.example .env
   ```

   - Open `.env` and provide the same values you use (or copy from Firebase Console → Project settings → General → Your apps → Web (</>) → Config).
   - Ensure variable names match those used in code: `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID`.

3. Start the app

   ```bash
   npx expo start
   ```

   - Press `a` to open Android emulator, `w` for web, or scan the QR code with Expo Go.

4. Optional: run native Android build

   ```bash
   npx expo run:android
   ```

   This compiles the native project instead of using Expo Go.

5. Firebase Auth domains (if using Auth)

   - In Firebase Console → Authentication → Settings → Authorized domains add: `localhost`, `127.0.0.1`, and any LAN host Expo shows.

6. Troubleshooting

   - If env variables don’t load, restart Metro and clear cache:
     ```bash
     npx expo start -c
     ```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
