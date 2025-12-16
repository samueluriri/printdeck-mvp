import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero'; 
import ProductGrid from './components/ProductGrid';
import ProductConfigurator from './components/ProductConfigurator';
import VendorDashboard from './components/VendorDashboard';
import VendorList from './components/VendorList';
import OrderHistory from './components/OrderHistory';
import RiderDashboard from './components/RiderDashboard'; 
import Footer from './components/Footer';
import Login from './components/Login';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
// 1. IMPORT Database tools for notifications
import { db } from './firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // 2. STATE: Track number of active orders for the badge
  const [notificationCount, setNotificationCount] = useState(0);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null); 
  
  const [showVendor, setShowVendor] = useState(false);
  const [showRider, setShowRider] = useState(false); 
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. LOGIC: Listen for Active Orders (Notifications)
  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }

    // Query: Get orders for this user
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid)
    );

    // Listen for changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Count orders that are NOT completed (Active)
      const activeOrders = snapshot.docs.filter(doc => {
        const status = doc.data().status;
        return status !== 'Completed' && status !== 'Cancelled';
      });
      setNotificationCount(activeOrders.length);
    });

    return () => unsubscribe();
  }, [user]);

  const resetFlow = () => {
    setSelectedProduct(null);
    setSelectedVendor(null);
    setShowVendor(false);
    setShowRider(false);
    setShowHistory(false);
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth);
    resetFlow();
  };

  const scrollToProducts = () => {
    const element = document.getElementById('products-section');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* 4. PASS the count to Navbar */}
      <Navbar 
        user={user} 
        activeCount={notificationCount} // <--- Passing the count here
        onLogout={handleLogout}
        onMyOrders={() => { resetFlow(); setShowHistory(true); }} 
        onHome={resetFlow}
      />
      
      {/* Dev Mode Bar */}
      <div className="bg-gray-800 text-white p-2 text-center text-sm flex justify-center items-center space-x-4">
        <span className="text-gray-400">Dev Mode:</span>
        <button 
          onClick={() => { resetFlow(); setShowVendor(true); }}
          className={`underline font-bold hover:text-yellow-300 ${showVendor ? 'text-yellow-300' : 'text-yellow-500'}`}
        >
          Vendor App
        </button>
        <span className="text-gray-600">|</span>
        <button 
          onClick={() => { resetFlow(); setShowRider(true); }}
          className={`underline font-bold hover:text-green-300 ${showRider ? 'text-green-300' : 'text-green-500'}`}
        >
          Rider App
        </button>
        <span className="text-gray-600">|</span>
        <button onClick={resetFlow} className="hover:text-white">Customer App</button>
      </div>

      <main className="flex-grow max-w-7xl mx-auto py-2 px-4 w-full">
        
        {/* VIEW LOGIC */}
        {showVendor ? (
          <VendorDashboard onBack={resetFlow} />
        ) : showRider ? (
          <RiderDashboard onBack={resetFlow} />
        ) : showHistory ? (
          <OrderHistory user={user} onBack={resetFlow} />
        ) : selectedProduct && selectedVendor ? (
          <ProductConfigurator 
            product={selectedProduct}
            vendor={selectedVendor}
            user={user}
            onBack={() => setSelectedVendor(null)}
          />
        ) : selectedProduct ? (
          <VendorList 
            product={selectedProduct}
            onSelectVendor={setSelectedVendor}
            onBack={() => setSelectedProduct(null)}
          />
        ) : (
          <>
            <Hero onStart={scrollToProducts} />
            <div id="products-section">
              <ProductGrid onSelectProduct={setSelectedProduct} />
            </div>
          </>
        )}
        
      </main>

      <Footer />
    </div>
  )
}