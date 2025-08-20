// src/lib/firebaseClient.import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration from environment variables
const getFirebaseConfig = () => {
  // Try to get the config from environment variables
  const firebaseConfigString = import.meta.env.VITE_FIREBASE_CONFIG;
  
  if (firebaseConfigString) {
    try {
      return JSON.parse(firebaseConfigString);
    } catch (error) {
      // Log error for debugging in development only
      if (import.meta.env.DEV) {
        console.error('Error parsing VITE_FIREBASE_CONFIG:', error);
      }
    }
  }

  // Fallback configuration using individual environment variables
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
};

const firebaseConfig = getFirebaseConfig();

// Validate configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  // Log warning for debugging in development only
  if (import.meta.env.DEV) {
    console.warn(`Missing Firebase configuration fields: ${missingFields.join(', ')}`);
    console.warn('Messaging and real-time features will be disabled');
  }
}

// Initialize Firebase
let app = null;
let db = null;
let auth = null;

try {
  if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Connect to emulator in development
    if (import.meta.env.DEV && !db._delegate._databaseId.database.includes('firestore.googleapis.com')) {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
      } catch (error) {
        // Emulator connection might fail if already connected
        if (import.meta.env.DEV) {
          console.log('Firebase emulator connection info:', error.message);
        }
      }
    }
  }
} catch (error) {
  // Log Firebase initialization errors for debugging
  if (import.meta.env.DEV) {
    console.error('Error initializing Firebase:', error);
  }
}

export { db, auth, app };
export const isFirebaseConfigured = () => !!firebaseConfig.projectId;
