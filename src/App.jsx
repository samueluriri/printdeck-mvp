import React, { useState, useEffect } from "react";

/* -------------------- FIREBASE -------------------- */
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

/* -------------------- COMPONENTS -------------------- */
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Upload from "./components/Upload";
import Footer from "./components/Footer";
import Login from "./components/Login";

/* -------------------- DASHBOARDS -------------------- */
import VendorDashboard from "./features/vendor/VendorDashboard";
import CustomerDashboard from "./features/customer/CustomerDashboard";
import RiderDashboard from "./features/rider/RiderDashboard";

/* -------------------- MAIN APP -------------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const [userRole, setUserRole] = useState("customer");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentView, setCurrentView] = useState("home");
  const [showLogin, setShowLogin] = useState(false);

  /* -------------------- AUTH LISTENER -------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setShowLogin(false);
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUserRole(snap.data().role || "customer");
        } else {
          await setDoc(ref, {
            email: currentUser.email,
            role: "customer",
            createdAt: new Date(),
          });
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* -------------------- ORDERS NOTIFICATION -------------------- */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotificationCount(snap.docs.length);
    });

    return () => unsub();
  }, [user]);

  /* -------------------- HANDLERS -------------------- */
  const handleStart = () => {
    if (user) {
      setCurrentView("upload");
    } else {
      setShowLogin(true);
    }
  };

  const handleSelectProduct = (product) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setSelectedProduct(product);
    setCurrentView("upload");
  };

  /* -------------------- ROUTING -------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading PrintDeck...</p>
        </div>
      </div>
    );

  // If user clicks login/started but not auth'd
  if (showLogin && !user) {
    return <Login onBack={() => setShowLogin(false)} />;
  }

  if (user && userRole === "vendor") return <VendorDashboard user={user} />;
  if (user && userRole === "rider") return <RiderDashboard user={user} />;

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 font-sans">
      {currentView !== "home" && (
        <Navbar
          user={user}
          activeCount={notificationCount}
          onLogout={() => signOut(auth)}
          onMyOrders={() => {
            setSelectedProduct(null);
            setCurrentView("history");
          }}
          onHome={() => {
            setSelectedProduct(null);
            setCurrentView("home");
          }}
          onLogin={() => setShowLogin(true)}
        />
      )}

      <main className={`flex-grow ${currentView !== "home" ? "pt-20" : ""}`}>
        {currentView === "history" ? (
          <div className="max-w-7xl mx-auto py-10 px-6">
            <h2 className="text-3xl font-bold mb-6 text-slate-800">My Order History</h2>
            <CustomerDashboard user={user} />
          </div>
        ) : selectedProduct || currentView === "upload" ? (
          <div className="animate-fade-in-up">
            <div className="max-w-7xl mx-auto pt-10 px-6">
              <button
                onClick={() => { setSelectedProduct(null); setCurrentView("home"); }}
                className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-4"
              >
                ← Back to Home
              </button>
            </div>
            <Upload />
          </div>
        ) : (
          <>
            <LandingPage
              onStart={handleStart}
              notificationCount={notificationCount}
              user={user}
              onLogin={() => setShowLogin(true)}
              onMyOrders={() => setCurrentView("history")}
            />
          </>
        )}
      </main>

      {currentView !== "home" && <Footer />}
    </div>
  );
}
