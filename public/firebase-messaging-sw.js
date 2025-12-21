importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// 1. Initialize Firebase inside the Service Worker
// (This runs in the background of the browser)
firebase.initializeApp({
  apiKey: "AIzaSyC9ok0WDeQldVtZ-tNDHE4vqVbk8udC7zQ",
  authDomain: "printdeck-app.firebaseapp.com",
  projectId: "printdeck-app",
  storageBucket: "printdeck-app.firebasestorage.app",
  messagingSenderId: "928765258106",
  appId: "1:928765258106:web:ebfa9cd0de5da06a914ec3"
});

const messaging = firebase.messaging();

// 2. Handle Background Messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg' // Your app logo (ensure this file exists in public folder)
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});