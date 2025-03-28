import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Replace these with your Firebase config values from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAQVMls3e6y1TlA7qGAw3GqxZbLNYdLlyg",
  authDomain: "life-quest-d8995.firebaseapp.com",
  projectId: "life-quest-d8995",
  storageBucket: "life-quest-d8995.firebasestorage.app",
  messagingSenderId: "323449557827",
  appId: "1:323449557827:web:81d3dfd15c80fb665f95f6",
  measurementId: "G-SNKGY8D5XT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 