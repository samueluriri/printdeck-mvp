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

/* -------------------- CORE COMPONENTS -------------------- */
import Upload from "./components/Upload";

/* -------------------- DASHBOARDS -------------------- */
import VendorDashboard from "./features/vendor/VendorDashboard";
import CustomerDashboard from "./features/customer/CustomerDashboard";
import RiderDashboard from "./features/rider/RiderDashboard";

/* -------------------- MOCK / TEMP COMPONENTS -------------------- */
const Navbar = ({ user, activeCount, onLogout, onMyOrders, onHome, darkMode }) => (
  <nav
    className={`p-4 shadow flex justify-between items-center sticky top-0 z-50 ${
      darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
    }`}
  >
    <button onClick={onHome} className="font-bold text-xl text-blue-600">
      PrintDeck
    </button>
    <div className="flex gap-4 items-center">
      <button onClick={onMyOrders} className="font-medium hover:text-blue-500">
        My Orders{" "}
        {activeCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </button>
      <button
        onClick={onLogout}
        className="text-red-500 font-medium border px-3 py-1 rounded hover:bg-red-50"
      >
        Log Out
      </button>
    </div>
  </nav>
);

const Hero = ({ onStart }) => (
  <div className="bg-blue-600 text-white text-center py-20 px-4 rounded-b-3xl">
    <h1 className="text-4xl font-extrabold mb-4">
      Print Anything, Delivered Fast.
    </h1>
    <p className="mb-8 opacity-90">
      Upload documents from your room and get them delivered in minutes.
    </p>
    <button
      onClick={onStart}
      className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition"
    >
      Start Printing
    </button>
  </div>
);

const ProductGrid = ({ onSelectProduct }) => (
  <div className="py-12 px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
    {["A4 Document", "Banner", "Stickers", "Business Cards"].map((p, i) => (
      <div
        key={i}
        onClick={() => onSelectProduct({ name: p })}
        className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md cursor-pointer text-center"
      >
        <div className="text-4xl mb-4">📄</div>
        <h3 className="font-bold">{p}</h3>
      </div>
    ))}
  </div>
);

const Footer = () => (
  <footer className="bg-gray-900 text-white py-8 text-center text-sm mt-auto">
    © 2025 PrintDeck
  </footer>
);

/* -------------------- MAIN APP -------------------- */
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const [userRole, setUserRole] = useState("customer");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentView, setCurrentView] = useState("home");

  /* -------------------- AUTH LISTENER -------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
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

  /* -------------------- ROUTING -------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (userRole === "vendor") return <VendorDashboard user={user} />;
  if (userRole === "rider") return <RiderDashboard user={user} />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        user={user}
        activeCount={notificationCount}
        onLogout={() => signOut(auth)}
        onMyOrders={() => setCurrentView("history")}
        onHome={() => setCurrentView("home")}
        darkMode={darkMode}
      />

      <main className="flex-grow">
        {currentView === "history" ? (
          <CustomerDashboard user={user} />
        ) : selectedProduct ? (
          <Upload />
        ) : (
          <>
            <Hero onStart={() => {}} />
            <ProductGrid onSelectProduct={setSelectedProduct} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
