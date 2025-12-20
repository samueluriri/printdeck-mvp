import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, onSnapshot, doc, updateDoc, getDoc, where, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";

// --- Firebase Initialization ---
let app, db, auth;
try {
  const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
  if (!getApps().length) { app = initializeApp(firebaseConfig); } else { app = getApp(); }
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) { console.error("Firebase Init Error:", error); }

export default function RiderDashboard({ onBack, user }) {
  // Auth State
  const [internalUser, setInternalUser] = useState(null);
  const currentUser = user || internalUser;

  // Data State
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myActiveJobs, setMyActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]); 
  
  // Wallet State
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);

  // Store rider's vehicle type to filter jobs
  const [riderVehicleType, setRiderVehicleType] = useState('Motorcycle');
  // Track GPS status
  const [gpsActive, setGpsActive] = useState(false);
  
  const [activeTab, setActiveTab] = useState('active');

  // 1. Initial Auth & Profile
  useEffect(() => {
    if(!auth) return;
    const init = async () => {
         try { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth); } catch(e){}
    };
    init();
    const unsub = onAuthStateChanged(auth, async (u) => {
        setInternalUser(u);
        if (u && db) {
            try {
                const userDoc = await getDoc(doc(db, "users", u.uid));
                if (userDoc.exists()) {
                    setRiderVehicleType(userDoc.data().vehicleType || 'Motorcycle');
                }
            } catch(e) { console.warn("Profile fetch error", e); }
        }
    });
    return () => unsub();
  }, []);

  // 2. REAL-TIME GPS TRACKING
  useEffect(() => {
    if (!currentUser || !db || !navigator.geolocation) return;

    const success = (position) => {
      setGpsActive(true);
      const { latitude, longitude } = position.coords;
      
      updateDoc(doc(db, "users", currentUser.uid), {
        currentLocation: { lat: latitude, lng: longitude },
        lastLocationUpdate: new Date()
      }).catch(e => console.log("Location sync silent fail:", e.message));
    };

    const error = (err) => {
      console.warn(`GPS ERROR(${err.code}): ${err.message}`);
      setGpsActive(false);
    };

    const id = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true, timeout: 10000, maximumAge: 0
    });
    return () => navigator.geolocation.clearWatch(id);
  }, [currentUser]);

  // 3. Real-time Jobs Data
  useEffect(() => {
    if (!db || !currentUser) return;

    const qAvailable = query(collection(db, "orders")); // In real app: where status == Ready

    const unsub = onSnapshot(qAvailable, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter in memory for demo purposes
      setAvailableJobs(allOrders.filter(o => o.status === 'Ready for Pickup'));
      setMyActiveJobs(allOrders.filter(o => o.status === 'Out for Delivery' && o.riderId === currentUser.uid));
      setCompletedJobs(allOrders.filter(o => o.status === 'Completed' && o.riderId === currentUser.uid));
    });

    return () => unsub();
  }, [currentUser]);

  const openNavigation = (address) => {
    const destination = address || "Unilag Main Gate, Lagos, Nigeria";
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  const acceptJob = async (orderId) => {
    if (!db || !currentUser) return;
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Out for Delivery",
        riderId: currentUser.uid 
      });
      alert("Job Accepted! Navigate to the vendor for pickup.");
    } catch (e) {
      console.error("Error accepting job:", e);
    }
  };

  const completeJob = async (orderId) => {
    if (!db) return;
    const confirm = window.confirm("Are you sure you have delivered the package?");
    if (!confirm) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Completed",
        deliveredAt: new Date()
      });
    } catch (e) {
      console.error("Error completing job:", e);
    }
  };

  const filteredAvailableJobs = availableJobs.filter(job => {
    if (!riderVehicleType) return true;
    // Simple logic to parse "2.5km"
    const distanceVal = parseFloat((job.vendorDistance || "0").toString().replace('km', '').trim());
    if (riderVehicleType === 'Bicycle') {
      return distanceVal <= 5;
    }
    return true;
  });

  // --- Wallet Logic ---
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.deliveryFee || 500), 0);
  const currentBalance = totalEarnings - withdrawals.reduce((acc, w) => acc + w.amount, 0);

  const handleWithdraw = (e) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (!val || val <= 0) return alert("Enter valid amount");
    if (val > currentBalance) return alert("Insufficient funds");
    
    setWithdrawals([{
        id: Date.now(), 
        amount: val, 
        createdAt: new Date(), 
        status: 'Processing',
        description: 'Withdrawal to Bank'
    }, ...withdrawals]);
    setWithdrawOpen(false);
    setWithdrawAmount("");
    alert("Withdrawal initiated successfully!");
  };

  // Merge history for the "History" tab
  const transactionHistory = [
    ...withdrawals.map(w => ({...w, type: 'debit'})),
    ...completedJobs.map(j => ({
        id: j.id,
        amount: j.deliveryFee || 500,
        createdAt: j.deliveredAt ? (j.deliveredAt.toDate ? j.deliveredAt.toDate() : new Date(j.deliveredAt)) : new Date(),
        description: `Delivery: ${j.productName}`,
        type: 'credit'
    }))
  ].sort((a,b) => b.createdAt - a.createdAt);

  if (!db || !currentUser) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-black rounded-full animate-spin border-t-transparent"></div></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Rider App 🛵</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Logistics & Delivery</p>
            {gpsActive ? (
              <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                GPS Live
              </span>
            ) : (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                GPS Connecting...
              </span>
            )}
          </div>
          {riderVehicleType && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full mt-1 inline-block">
              Vehicle: {riderVehicleType}
            </span>
          )}
        </div>
        <button onClick={onBack} className="text-gray-600 font-medium hover:text-red-600 px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm">
          Go Offline
        </button>
      </div>

      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'active' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Active Tasks
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          History & Earnings
        </button>
      </div>

      {activeTab === 'active' ? (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-700">New Requests</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                {filteredAvailableJobs.length} Available
              </span>
            </div>
            
            <div className="space-y-4">
              {filteredAvailableJobs.map(job => (
                <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 text-lg">{job.vendorName || "Vendor"}</h4>
                    <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded font-bold">
                      ₦{job.deliveryFee ? job.deliveryFee.toLocaleString() : '500'} Earn
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 my-3 pl-2 border-l-2 border-dashed border-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <p className="text-xs text-gray-500">Pickup: <span className="text-gray-700 font-medium">{job.productName}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <p className="text-xs text-gray-500">Dropoff: <span className="text-gray-700 font-medium">{job.userEmail || "Customer"}</span></p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 ml-1">
                    {job.vendorDistance || '2km'} Trip 
                    {riderVehicleType === 'Bicycle' && parseFloat((job.vendorDistance || "0").toString().replace('km', '')) > 5 && (
                      <span className="text-red-500 font-bold ml-2">(Long Distance)</span>
                    )}
                  </p>

                  <button 
                    onClick={() => acceptJob(job.id)}
                    className="w-full bg-black text-white text-sm font-bold py-3 rounded-lg shadow hover:bg-gray-800 transition flex justify-center items-center gap-2"
                  >
                    <span>⚡</span> Accept Delivery
                  </button>
                </div>
              ))}
              {filteredAvailableJobs.length === 0 && (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm">Searching for nearby jobs...</p>
                  {riderVehicleType === 'Bicycle' && (
                    <p className="text-xs text-gray-400 mt-2">Note: Showing only jobs under 5km for Bicycles.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-700">Current Trip</h3>
              {myActiveJobs.length > 0 && <span className="animate-pulse w-3 h-3 bg-green-500 rounded-full"></span>}
            </div>
            
            <div className="space-y-4">
              {myActiveJobs.map(job => (
                <div key={job.id} className="bg-white p-0 rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">● On Trip</span>
                    <span className="text-xs text-blue-400">Order #{job.id.slice(0,4)}</span>
                  </div>

                  <div className="p-5">
                    <h4 className="font-bold text-2xl text-gray-900 mb-1">{job.quantity || 1}x Items</h4>
                    <p className="text-sm text-gray-500 mb-6">{job.productName} from {job.vendorName}</p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-6 flex items-start gap-3">
                      <span className="text-2xl mt-1">📍</span>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Destination</p>
                        <p className="text-sm font-bold text-gray-800">
                          12, Herbert Macaulay Way, Yaba
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Customer: {job.userEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        onClick={() => openNavigation("12 Herbert Macaulay Way, Yaba, Lagos")}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow hover:bg-blue-700 flex justify-center items-center gap-2"
                      >
                        <span>🗺️</span> Navigate
                      </button>
                      
                      <button 
                        onClick={() => completeJob(job.id)}
                        className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold shadow hover:bg-green-700 flex justify-center items-center gap-2"
                      >
                        <span>✓</span> Arrived
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {myActiveJobs.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl grayscale">🛵</div>
                  <p className="text-gray-500 text-sm">You are offline.</p>
                  <p className="text-xs text-gray-400">Accept a request to start driving.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in">
          {/* Enhanced Earnings Card */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
             {/* Abstract circles to match old feel */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-green-100 font-medium mb-1">Total Available Balance</p>
                        <h3 className="text-4xl font-bold">₦{currentBalance.toLocaleString()}</h3>
                        <p className="text-sm text-green-100 mt-2">{completedJobs.length} Deliveries Completed</p>
                    </div>
                    <button 
                        onClick={() => setWithdrawOpen(true)}
                        className="bg-white text-green-700 px-6 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-green-50 transition"
                    >
                        Withdraw
                    </button>
                </div>
            </div>
          </div>

          <h3 className="font-bold text-lg text-gray-700 mb-4">Transaction History</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {transactionHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No transactions yet.</div>
            ) : (
              transactionHistory.map((txn, i) => (
                <div key={i} className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-gray-900 ${txn.type === 'debit' ? 'text-gray-500' : ''}`}>
                         {txn.description}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                          txn.type === 'debit' 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                          {txn.type === 'debit' ? 'Pending' : 'Completed'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{txn.createdAt.toDateString()} • {txn.createdAt.toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`block font-bold ${txn.type === 'debit' ? 'text-red-500' : 'text-green-600'}`}>
                        {txn.type === 'debit' ? '-' : '+'}₦{txn.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Withdraw Modal - Simple Clean UI to match the theme */}
      {withdrawOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in zoom-in-95">
                <h3 className="font-bold text-xl text-gray-900 mb-4">Withdraw Funds</h3>
                <p className="text-sm text-gray-500 mb-4">Available Balance: ₦{currentBalance.toLocaleString()}</p>
                
                <form onSubmit={handleWithdraw}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount</label>
                        <input 
                            type="number" 
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full text-2xl font-bold border-b-2 border-gray-200 py-2 focus:outline-none focus:border-green-600"
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setWithdrawOpen(false)} className="flex-1 py-3 bg-gray-100 font-bold text-gray-500 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg">Confirm</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}