import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAvAUbwSj822DvQuqUWikKWakfLAOUNcB8",
  authDomain: "freedom2operate-76908.firebaseapp.com",
  projectId: "freedom2operate-76908",
  storageBucket: "freedom2operate-76908.firebasestorage.app",
  messagingSenderId: "289140126739",
  appId: "1:289140126739:web:400cb9b6732536b1fd3be6",
  measurementId: "G-HTQ8VKT790"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only if supported
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export const auth = getAuth(app);
export default app;
