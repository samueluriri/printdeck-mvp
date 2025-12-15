import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ProductConfigurator from './components/ProductConfigurator';
import VendorDashboard from './components/VendorDashboard';
import VendorList from './components/VendorList';
import OrderHistory from './components/OrderHistory';
import RiderDashboard from './components/RiderDashboard'; // 1. Import Rider App
import Footer from './components/Footer';
import Login from './components/Login';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null); 
  
  // VIEW STATES
  const [showVendor, setShowVendor] = useState(false);
  const [showRider, setShowRider] = useState(false); // 2. New State for Rider
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        onMyOrders={() => { resetFlow(); setShowHistory(true); }} 
        onHome={resetFlow}
      />
      
      {/* Dev Mode Bar - Updated with Rider Switch */}
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

        <button onClick={resetFlow} className="hover:text-white">
          Customer App
        </button>
      </div>

      <main className="flex-grow max-w-7xl mx-auto py-10 px-4 w-full">
        
        {/* VIEW LOGIC: Check which screen to show */}
        {showVendor ? (
          <VendorDashboard onBack={resetFlow} />
        ) : showRider ? (
          // 3. Show Rider Dashboard
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
            <div className="text-center mt-10 mb-20">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Printing made seamless.
              </h2>
              <p className="text-xl text-gray-600">
                Connect with local print shops and get delivery in minutes.
              </p>
              <button className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition">
                Start Printing
              </button>
            </div>
            <ProductGrid onSelectProduct={setSelectedProduct} />
          </>
        )}
        
      </main>

      <Footer />
    </div>
  )
}