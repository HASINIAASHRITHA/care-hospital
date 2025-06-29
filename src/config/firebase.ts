import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAc0M_ToTwK-hodWQgqsBrfdDKnSW0f5Kc",
  authDomain: "care-hospital-30398.firebaseapp.com",
  projectId: "care-hospital-30398",
  storageBucket: "care-hospital-30398.firebasestorage.app",
  messagingSenderId: "987391498357",
  appId: "1:987391498357:web:ee1ba7f7aef571f85dc03c",
  measurementId: "G-Y18JGT62RR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  APPOINTMENTS: 'appointments',
  HEALTH_RECORDS: 'healthRecords',
  CONTACT_MESSAGES: 'contactMessages',
  ADMIN_LOGS: 'adminLogs',
  DOCTORS: 'doctors'
};

export default app;
