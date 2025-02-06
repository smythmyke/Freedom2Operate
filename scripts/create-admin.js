import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

const adminEmail = 'admin@freedom2operate.com';
const adminPassword = process.env.ADMIN_PASSWORD; // Will be provided securely

if (!adminPassword) {
  console.error('Please set ADMIN_PASSWORD environment variable');
  process.exit(1);
}

async function createAdminAccount() {
  try {
    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );

    // Set up admin profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: adminEmail,
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    });

    console.log('Admin account created successfully');
    console.log('Admin UID:', userCredential.user.uid);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
}

createAdminAccount();
