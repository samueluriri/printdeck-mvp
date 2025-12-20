import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC9ok0WDeQldVtZ-tNDHE4vqVbk8udC7zQ",
  authDomain: "printdeck-app.firebaseapp.com",
  projectId: "printdeck-app",
  storageBucket: "printdeck-app.firebasestorage.app",
  messagingSenderId: "928765258106",
  appId: "1:928765258106:web:ebfa9cd0de5da06a914ec3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// SAFE INITIALIZATION: Only initialize messaging if supported
let messaging = null;
try {
  if (typeof window !== 'undefined') {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.log("Firebase Messaging is not supported in this environment (likely not HTTPS or blocked).");
}

export { messaging };