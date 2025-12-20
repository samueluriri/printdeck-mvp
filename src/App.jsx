import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero'; 
import ProductGrid from './components/ProductGrid';
import ProductConfigurator from './components/ProductConfigurator';
import VendorDashboard from './components/VendorDashboard';
import VendorList from './components/VendorList';
import OrderHistory from './components/OrderHistory';
import RiderDashboard from './components/RiderDashboard'; 
import AdminDashboard from './components/AdminDashboard';
import LiveTracking from './components/LiveTracking'; 
import RiderRegistration from './components/RiderRegistration';
// 1. IMPORT NOTIFICATION HANDLER
import PushNotificationHandler from './components/PushNotificationHandler'; 
import Footer from './components/Footer';
import Login from './components/Login';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const [userRole, setUserRole] = useState('customer');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null); 
  const [trackingOrder, setTrackingOrder] = useState(null);
  
  const [currentView, setCurrentView] = useState('home'); 

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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
      case 'rider_onboarding':
        document.title = "Rider Registration | PrintDeck";
        break;
      default:
        if (trackingOrder) {
          document.title = "Tracking Order | PrintDeck";
        } else if (selectedProduct) {
          document.title = `Configure ${selectedProduct.name} | PrintDeck`;
        } else {
          document.title = "PrintDeck | Print Anything, Delivered Fast";
        }
    }
  }, [currentView, selectedProduct, trackingOrder]);

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
    setTrackingOrder(null);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950 dark:text-white">Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar 
        user={user} 
        activeCount={notificationCount}
        onLogout={handleLogout}
        onMyOrders={() => { resetFlow(); setCurrentView('history'); }} 
        onHome={resetFlow}
        darkMode={darkMode} 
      />
      
      {/* 2. NOTIFICATION HANDLER ENABLED */}
      <PushNotificationHandler user={user} />

      {/* SECURITY BAR / ROLE SWITCHER */}
      <div className="bg-gray-800 text-white p-2 text-center text-sm flex flex-wrap justify-center items-center gap-4 mt-16 dark:bg-gray-900 dark:border-b dark:border-gray-800">
        <span className="text-gray-400 font-mono uppercase hidden sm:inline">Role: {userRole}</span>
        
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

        {!isRider && !isAdmin && !isVendor && (
          <>
            <span className="text-gray-600">|</span>
            <button 
              onClick={() => setCurrentView('rider_onboarding')}
              className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
            >
              🚀 Become a Rider
            </button>
          </>
        )}

        <span className="text-gray-600">|</span>
        <button onClick={resetFlow} className="hover:text-white">Customer View</button>
      </div>

      <main className={`flex-grow max-w-7xl mx-auto px-4 w-full ${ (isAdmin || isVendor || isRider || currentView === 'rider_onboarding') ? 'py-6' : 'pt-24 pb-10' }`}>
        {currentView === 'rider_onboarding' ? (
          <RiderRegistration 
            user={user} 
            onComplete={() => {
              window.location.reload();
            }}
            onCancel={resetFlow} 
          />
        ) : trackingOrder ? (
          <LiveTracking 
            order={trackingOrder} 
            onBack={() => setTrackingOrder(null)} 
          />
        ) : currentView === 'admin' && isAdmin ? (
          <AdminDashboard onBack={resetFlow} />
        ) : currentView === 'vendor' && (isAdmin || isVendor) ? (
          // 3. UPDATED: Passing 'user' to VendorDashboard for chat
          <VendorDashboard onBack={resetFlow} user={user} />
        ) : currentView === 'rider' && (isAdmin || isRider) ? (
          <RiderDashboard onBack={resetFlow} />
        ) : currentView === 'history' ? (
          <OrderHistory 
            user={user} 
            onBack={resetFlow} 
            onTrackOrder={(order) => setTrackingOrder(order)} 
          />
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

      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-50 transition-all duration-300 hover:scale-110 bg-indigo-600 text-white dark:bg-yellow-400 dark:text-gray-900"
        title="Toggle Dark Mode"
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        )}
      </button>

    </div>
  )
}