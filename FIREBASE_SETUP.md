# Firebase Google Authentication Setup

## Prerequisites
1. A Firebase project
2. Google Authentication enabled in Firebase Console

## Setup Instructions

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to Authentication > Sign-in method
4. Enable Google as a sign-in provider
5. Add your domain to authorized domains (for production)

### 2. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click on the web app icon or create a new web app
4. Copy the configuration object

### 3. Configure Your App
1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration values:
   ```
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### 4. Alternative: Direct Configuration
Instead of environment variables, you can directly edit `src/firebase/config.ts` and replace the placeholder values with your actual Firebase configuration.

## How It Works
- Users must sign in with Google before accessing the app
- The app shows a login screen until authentication is complete
- User profile and sign-out button appear in the top-right corner
- Authentication state is managed globally via React Context

## Development
```bash
npm run dev
```

The app will require Google authentication before showing the product page.
