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

async function verifyAdmin() {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail('admin@freedom2operate.com');
    console.log('User exists in Auth:', userRecord);

    // Get user profile from Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    console.log('User profile in Firestore:', userDoc.data());

    // Update password
    await admin.auth().updateUser(userRecord.uid, {
      password: '6Pack2024!!!'
    });

    console.log('Password updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAdmin();
