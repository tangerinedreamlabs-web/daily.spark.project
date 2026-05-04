// Firebase configuration for DailySparkPractice.com
// Replace these placeholder values with your Firebase Web App config from Firebase Console.
// Firebase Console > Project settings > General > Your apps > Web app > SDK setup and configuration.

export const firebaseConfig = {
  apiKey: "REPLACE_WITH_API_KEY",
  authDomain: "REPLACE_WITH_PROJECT_ID.firebaseapp.com",
  projectId: "REPLACE_WITH_PROJECT_ID",
  storageBucket: "REPLACE_WITH_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID",
  measurementId: "REPLACE_WITH_MEASUREMENT_ID" // Optional, used for Firebase Analytics when enabled.
};

export const FIRESTORE_COLLECTIONS = {
  prospects: "prospects",
  conversions: "conversions"
};

export const ENABLE_FIREBASE_ANALYTICS = true;
