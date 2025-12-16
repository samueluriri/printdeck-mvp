import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero'; 
import ProductGrid from './components/ProductGrid';
import ProductConfigurator from './components/ProductConfigurator';
import VendorDashboard from './components/VendorDashboard';
import VendorList from './components/VendorList';
import OrderHistory from './components/OrderHistory';
import RiderDashboard from './components/RiderDashboard'; 
// 1. IMPORT ADMIN DASHBOARD
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import Login from './components/Login';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const [userRole, setUserRole] = useState('customer');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null); 
  
  // VIEW STATES
  // 'home', 'vendor', 'rider', 'history', 'admin'
  const [currentView, setCurrentView] = useState('home'); 

  // BRANDING POLISH: Dynamic Document Title
  useEffect(() => {
    switch (currentView) {
      case 'vendor':
        document.title = "Vendor Dashboard | PrintDeck";
        break;
      case 'rider':
        document.title = "Rider App | PrintDeck";
        break;
      case 'admin':
        document.title = "Admin Ops | PrintDeck";
        break;
      case 'history':
        document.title = "My Orders | PrintDeck";
        break;
      default:
        // Check if configuring product
        if (selectedProduct) {
          document.title = `Configure ${selectedProduct.name} | PrintDeck`;
        } else {
          document.title = "PrintDeck | Print Anything, Delivered Fast";
        }
    }
  }, [currentView, selectedProduct]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserRole(data.role || 'customer');
            
            if (data.role === 'vendor') setCurrentView('vendor');
            else if (data.role === 'rider') setCurrentView('rider');
            else if (data.role === 'admin') setCurrentView('home'); 

          } else {
            await setDoc(userRef, {
              email: currentUser.email,
              role: 'customer',
              createdAt: new Date()
            });
            setUserRole('customer');
          }
        } catch (e) {
          console.error("Error handling user profile:", e);
          setUserRole('customer'); 
        }
      } else {
        setUserRole('customer');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const isAdmin = userRole === 'admin';
  const isVendor = userRole === 'vendor';
  const isRider = userRole === 'rider';

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
      
      {/* SECURITY BAR */}
      {(isAdmin || isVendor || isRider) && (
        <div className="bg-gray-800 text-white p-2 text-center text-sm flex flex-wrap justify-center items-center gap-4">
          <span className="text-gray-400 font-mono uppercase hidden sm:inline">Role: {userRole}</span>
          
          {/* 2. ADMIN ONLY BUTTON */}
          {isAdmin && (
            <button 
              onClick={() => setCurrentView('admin')}
              className={`underline font-bold hover:text-purple-300 ${currentView === 'admin' ? 'text-purple-300' : 'text-purple-400'}`}
            >
              Admin Ops
            </button>
          )}

          {(isAdmin || isVendor) && (
            <button 
              onClick={() => setCurrentView('vendor')}
              className={`underline font-bold hover:text-yellow-300 ${currentView === 'vendor' ? 'text-yellow-300' : 'text-yellow-500'}`}
            >
              Vendor Dash
            </button>
          )}
          
          {(isAdmin || isRider) && (
            <button 
              onClick={() => setCurrentView('rider')}
              className={`underline font-bold hover:text-green-300 ${currentView === 'rider' ? 'text-green-300' : 'text-green-500'}`}
            >
              Rider App
            </button>
          )}

          <span className="text-gray-600">|</span>
          <button onClick={resetFlow} className="hover:text-white">Customer View</button>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto py-2 px-4 w-full">
        
        {/* VIEW LOGIC */}
        {currentView === 'admin' && isAdmin ? (
          <AdminDashboard onBack={resetFlow} />
        ) : currentView === 'vendor' && (isAdmin || isVendor) ? (
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