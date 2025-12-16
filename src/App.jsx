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
import { db } from './firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null); 
  
  // VIEW STATES
  const [currentView, setCurrentView] = useState('home'); // 'home', 'vendor', 'rider', 'history'

  // SECURITY CONFIGURATION
  // In a real app, these roles would be stored in the database under a 'users' collection
  const ADMIN_EMAIL = "admin@printdeck.com";
  const VENDOR_EMAILS = ["vendor@printdeck.com", "shop@rapidprint.com"];
  const RIDER_EMAILS = ["rider@printdeck.com"];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Auto-redirect vendors/riders to their dashboards upon login
      if (currentUser) {
        if (VENDOR_EMAILS.includes(currentUser.email)) {
          setCurrentView('vendor');
        } else if (RIDER_EMAILS.includes(currentUser.email)) {
          setCurrentView('rider');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // NOTIFICATION LOGIC
  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
    setCurrentView('home');
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

  // CHECK ROLES
  const isAdmin = user && user.email === ADMIN_EMAIL;
  const isVendor = user && VENDOR_EMAILS.includes(user.email);
  const isRider = user && RIDER_EMAILS.includes(user.email);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar 
        user={user} 
        activeCount={notificationCount}
        onLogout={handleLogout}
        onMyOrders={() => { resetFlow(); setCurrentView('history'); }} 
        onHome={resetFlow}
      />
      
      {/* SECURITY BAR: Only visible to Admins, Vendors, or Riders */}
      {(isAdmin || isVendor || isRider) && (
        <div className="bg-gray-800 text-white p-2 text-center text-sm flex justify-center items-center space-x-4">
          <span className="text-gray-400 font-mono">Role: {isAdmin ? "Admin" : isVendor ? "Vendor" : "Rider"}</span>
          
          {(isAdmin || isVendor) && (
            <button 
              onClick={() => setCurrentView('vendor')}
              className={`underline font-bold hover:text-yellow-300 ${currentView === 'vendor' ? 'text-yellow-300' : 'text-yellow-500'}`}
            >
              Vendor Dashboard
            </button>
          )}
          
          {(isAdmin || isRider) && (
            <>
              <span className="text-gray-600">|</span>
              <button 
                onClick={() => setCurrentView('rider')}
                className={`underline font-bold hover:text-green-300 ${currentView === 'rider' ? 'text-green-300' : 'text-green-500'}`}
              >
                Rider App
              </button>
            </>
          )}

          <span className="text-gray-600">|</span>
          <button onClick={resetFlow} className="hover:text-white">Customer View</button>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto py-2 px-4 w-full">
        
        {/* SECURE VIEW LOGIC */}
        {currentView === 'vendor' && (isAdmin || isVendor) ? (
          <VendorDashboard onBack={resetFlow} />
        ) : currentView === 'rider' && (isAdmin || isRider) ? (
          <RiderDashboard onBack={resetFlow} />
        ) : currentView === 'history' ? (
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