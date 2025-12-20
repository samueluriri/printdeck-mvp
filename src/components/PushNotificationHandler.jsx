import React, { useEffect, useState } from 'react';
// FIX: Reverted to standard import to satisfy build tool
import { messaging, db } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';

export default function PushNotificationHandler({ user }) {
  const [permission, setPermission] = useState(Notification.permission);

  // DEBUGGING: Log status on load so we know why it's hiding
  useEffect(() => {
    console.log("[Notification Debug] Component Mounted");
    console.log("[Notification Debug] User:", user ? user.email : "No User");
    console.log("[Notification Debug] Permission State:", Notification.permission);
    console.log("[Notification Debug] Messaging Object:", messaging ? "Exists" : "NULL (Failed to init)");
  }, [user]);

  // If messaging failed to initialize (e.g. localhost), do NOT render anything
  if (!messaging) {
    console.warn("[Notification Debug] Messaging is null. Returning null.");
    return null;
  }

  // YOUR SPECIFIC VAPID KEY
  const VAPID_KEY = "BJOQONho00y9KdK7zBe46pczqbgqmN7T-BH6IlEAVSIU8Wvx8vHGezXFO4HCQmsY13D9tfKC1AwW6GGI4-YTJFo";

  const requestPermission = async () => {
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      console.log("[Notification Debug] Permission result:", permissionResult);

      if (permissionResult === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        console.log("FCM Token Generated:", token); // <--- LOOK FOR THIS IN CONSOLE

        if (user) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { fcmToken: token });
          console.log("Token saved to user profile.");
        }
      }
    } catch (error) {
      console.error("[Notification Debug] Error:", error);
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    if (permission === 'granted' && messaging) {
      console.log("[Notification Debug] Listening for foreground messages...");
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground Message received: ', payload);
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/vite.svg'
        });
      });
      return () => unsubscribe();
    }
  }, [permission]);

  // Show Prompt if permission is default
  if (permission === 'default' && user) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-indigo-100 dark:border-gray-700 max-w-sm animate-bounce-in">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔔</div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">Enable Notifications?</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Get real-time updates when your rider arrives.
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={requestPermission} className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Allow</button>
              <button onClick={() => setPermission('denied')} className="text-gray-500 text-xs font-bold px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Later</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}