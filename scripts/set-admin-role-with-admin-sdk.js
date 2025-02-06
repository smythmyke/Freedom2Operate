import admin from 'firebase-admin';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = require(join(__dirname, '../config/service-account-key.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setAdminRole() {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail('admin@freedom2operate.com');

    // Set admin role in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: 'admin@freedom2operate.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }, { merge: true });

    console.log('Admin role set successfully');
    console.log('Admin UID:', userRecord.uid);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  }
}

setAdminRole();
