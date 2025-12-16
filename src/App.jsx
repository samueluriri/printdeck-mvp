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
// IMPORT: Added doc, getDoc, setDoc for user profile management
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // NEW STATE: Store the user's role from database (default to customer)
  const [userRole, setUserRole] = useState('customer');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null); 
  
  // VIEW STATES
  const [currentView, setCurrentView] = useState('home'); // 'home', 'vendor', 'rider', 'history'

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        console.log("Auth State Changed: User logged in:", currentUser.email);
        
        // 1. DATABASE ROLE CHECK
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            console.log("User profile found in database.");
            // Existing User: Get their role
            const data = userSnap.data();
            setUserRole(data.role || 'customer');
            
            // Auto-redirect workers to their dashboards
            if (data.role === 'vendor') setCurrentView('vendor');
            else if (data.role === 'rider') setCurrentView('rider');
            else if (data.role === 'admin') setCurrentView('home'); 

          } else {
            console.log("No profile found. Creating new user profile in 'users' collection...");
            // New User: Create a profile in 'users' collection with default role
            await setDoc(userRef, {
              email: currentUser.email,
              role: 'customer', // Default role is ALWAYS customer
              createdAt: new Date()
            });
            console.log("User profile created successfully!");
            setUserRole('customer');
          }
        } catch (e) {
          console.error("Error handling user profile:", e);
          setUserRole('customer'); // Fallback to safe role
        }
      } else {
        console.log("User logged out.");
        setUserRole('customer');
      }
      
      setLoading(false);
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

  // 2. CHECK ROLES DYNAMICALLY
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
      
      {/* SECURITY BAR: Updated to show dynamic role */}
      {(isAdmin || isVendor || isRider) && (
        <div className="bg-gray-800 text-white p-2 text-center text-sm flex justify-center items-center space-x-4">
          <span className="text-gray-400 font-mono uppercase">Role: {userRole}</span>
          
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