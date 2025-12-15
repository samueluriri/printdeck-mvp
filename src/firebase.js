import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your specific configuration keys
const firebaseConfig = {
  apiKey: "AIzaSyC9ok0WDeQldVtZ-tNDHE4vqVbk8udC7zQ",
  authDomain: "printdeck-app.firebaseapp.com",
  projectId: "printdeck-app",
  storageBucket: "printdeck-app.firebasestorage.app",
  messagingSenderId: "928765258106",
  appId: "1:928765258106:web:ebfa9cd0de5da06a914ec3"
};

// 1. Initialize Firebase (Turn on the connection)
const app = initializeApp(firebaseConfig);

// 2. Export the Database (db) so other files can use it
export const db = getFirestore(app);