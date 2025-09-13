import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project configuration
// Or use environment variables (recommended for production)
const firebaseConfig = {
    apiKey: "AIzaSyDU8rhj849PWzEKaggP07Hb5Hnuci2N6nM",
    authDomain: "fir-95b26.firebaseapp.com",
    projectId: "fir-95b26",
    storageBucket: "fir-95b26.firebasestorage.app",
    messagingSenderId: "308188640277",
    appId: "1:308188640277:web:c65a7d6aefbdbe2ab84a1c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
