import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9ok0WDeQldVtZ-tNDHE4vqVbk8udC7zQ",
  authDomain: "printdeck-app.firebaseapp.com",
  projectId: "printdeck-app",
  storageBucket: "printdeck-app.appspot.com", // ✅ FIXED
  messagingSenderId: "928765258106",
  appId: "1:928765258106:web:ebfa9cd0de5da06a914ec3"
};

// --- SINGLETON APP INITIALIZATION ---
// Prevents "Firebase App already exists" during hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- CORE SERVICES ---
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // ✅ REQUIRED FOR UPLOADS

// --- OPTIONAL: CLOUD MESSAGING (SAFE INIT) ---
let messaging = null;
try {
  if (typeof window !== "undefined") {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.log(
    "Firebase Messaging not supported (likely HTTP, unsupported browser, or blocked)."
  );
}

export { messaging };
export default app;
