import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, onSnapshot, doc, updateDoc, getDoc, where, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";

// --- INSTRUCTIONS FOR LOCAL USE ---
// Once you have set up src/config/firebase.js locally, you can uncomment this line
// and delete the initialization block below to keep your code clean.
// import { db, auth } from '../../config/firebase';

// --- Firebase Initialization (Self-Contained for Preview Stability) ---
let app, db, auth;
try {
  const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase Init Error:", error);
}

// --- Icons ---
const BikeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>;
const NavIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;

// --- Rider Wallet Component ---
const RiderWallet = ({ deliveries }) => {
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawals, setWithdrawals] = useState([]);

    // Calculate Earnings (Using deliveryFee from order or default 500)
    const earnings = deliveries.map(d => ({
        id: d.id,
        amount: d.deliveryFee || 500,
        createdAt: d.createdAt,
        description: `Delivery: ${d.productName}`
    }));

    const totalEarned = earnings.reduce((acc, e) => acc + e.amount, 0);
    const currentBalance = totalEarned - withdrawals.reduce((acc, w) => acc + w.amount, 0);

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

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Wallet Card */}
            <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Total Earnings</p>
                    <h1 className="text-4xl font-extrabold mb-6">₦{currentBalance.toLocaleString()}</h1>
                    <button onClick={() => setWithdrawOpen(true)} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition shadow-lg shadow-orange-500/30">
                        Withdraw to Bank
                    </button>
                </div>
            </div>

            {/* History List */}
            <div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-3">Earnings History</h3>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    {withdrawals.length === 0 && earnings.length === 0 && <div className="p-8 text-center text-gray-400">No earnings yet.</div>}
                    {[...withdrawals.map(w => ({...w, type:'debit'})), ...earnings.map(e => ({...e, type:'credit'}))]
                        .sort((a,b) => {
                            const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
                            const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
                            return dateB - dateA;
                        })
                        .map((txn, i) => (
                        <div key={i} className="p-4 flex justify-between items-center border-b dark:border-gray-800 last:border-0">
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{txn.type === 'debit' ? 'Withdrawal' : txn.description}</p>
                                <p className="text-xs text-gray-500">
                                    {txn.createdAt?.seconds 
                                     ? new Date(txn.createdAt.seconds*1000).toLocaleDateString() 
                                     : new Date(txn.createdAt || 0).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`font-bold ${txn.type==='credit' ? 'text-green-600' : 'text-red-500'}`}>
                                {txn.type==='credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Withdraw Modal */}
            {withdrawOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 animate-in slide-in-from-bottom-10">
                        <h3 className="font-bold text-lg dark:text-white mb-4">Withdraw</h3>
                        <p className="text-sm text-gray-500 mb-4">Available: ₦{currentBalance.toLocaleString()}</p>
                        <input type="number" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} className="w-full p-3 border rounded-lg mb-4 text-xl font-bold dark:bg-gray-700 dark:text-white" placeholder="0.00" />
                        <div className="flex gap-3">
                            <button onClick={()=>setWithdrawOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                            <button onClick={handleWithdraw} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Rider Component ---
export default function RiderDashboard({ onBack = () => {}, user }) {
  const [internalUser, setInternalUser] = useState(null);
  const currentUser = user || internalUser;
  
  const [activeTab, setActiveTab] = useState('deliveries');
  const [orders, setOrders] = useState([]);
  const [gpsActive, setGpsActive] = useState(false);
  const [riderVehicleType, setRiderVehicleType] = useState('Motorcycle');

  // 1. Auth & Rider Profile
  useEffect(() => {
    if(!auth) return;
    const init = async () => {
         try { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth); } catch(e){}
    };
    init();
    const unsub = onAuthStateChanged(auth, async (u) => {
        setInternalUser(u);
        if (u && db) {
            // Fetch profile for vehicle type
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

  // 2. GPS Tracking
  useEffect(() => {
    if (!currentUser || !db || !navigator.geolocation) return;

    const success = (position) => {
      setGpsActive(true);
      const { latitude, longitude } = position.coords;
      // Update DB
      updateDoc(doc(db, "users", currentUser.uid), {
        currentLocation: { lat: latitude, lng: longitude },
        lastLocationUpdate: new Date()
      }).catch(e => {}); // Silent fail ok
    };

    const error = () => setGpsActive(false);

    const id = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
    return () => navigator.geolocation.clearWatch(id);
  }, [currentUser]);

  // 3. Real-time Orders
  useEffect(() => {
    if (!db || !currentUser) return;
    const q = query(collection(db, "orders")); 
    const unsub = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setOrders(list);
    });
    return () => unsub();
  }, [currentUser]);

  // Helper Functions
  const openNavigation = (address) => {
    const destination = address || "Unilag Main Gate, Lagos, Nigeria";
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  const acceptJob = async (orderId) => {
    if(!db || !currentUser) return;
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: "Out for Delivery", 
        riderId: currentUser.uid 
      });
    } catch(e) { alert("Error accepting job: " + e.message); }
  };

  const completeJob = async (orderId) => {
    if(!db) return;
    const confirm = window.confirm("Confirm delivery completion?");
    if (!confirm) return;
    try {
        await updateDoc(doc(db, "orders", orderId), { 
            status: "Completed",
            deliveredAt: new Date()
        });
    } catch(e) { alert("Error completing job"); }
  };

  // Filtering Logic
  const availableDeliveries = orders.filter(o => {
      // 1. Must be ready
      if (o.status !== 'Ready for Pickup') return false;
      // 2. Vehicle Constraint (e.g., Bicycle < 5km)
      if (riderVehicleType === 'Bicycle') {
          const dist = parseFloat((o.vendorDistance || "0").toString().replace('km',''));
          if (dist > 5) return false;
      }
      return true;
  });

  const myActiveJobs = orders.filter(o => o.riderId === currentUser?.uid && o.status === 'Out for Delivery');
  const completedDeliveries = orders.filter(o => o.riderId === currentUser?.uid && o.status === 'Completed');

  if (!db || !currentUser) return <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-black"><div className="w-8 h-8 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div></div>;

  return (
    <div className="max-w-md mx-auto bg-gray-50 dark:bg-black min-h-screen font-sans pb-24">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 p-4 sticky top-0 z-20 shadow-sm flex justify-between items-center border-b dark:border-gray-800">
            <div>
                <h1 className="text-xl font-extrabold italic text-gray-900 dark:text-white flex items-center gap-2"><BikeIcon /> RIDER APP</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-bold text-gray-500">{gpsActive ? 'GPS ACTIVE' : 'NO GPS SIGNAL'}</span>
                </div>
            </div>
            <div className="text-right">
                 <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg font-medium">{riderVehicleType}</span>
            </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 bg-white dark:bg-gray-900 mt-1">
            <button onClick={() => setActiveTab('deliveries')} className={`py-3 text-sm font-bold border-b-2 transition ${activeTab==='deliveries' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}>Deliveries</button>
            <button onClick={() => setActiveTab('wallet')} className={`py-3 text-sm font-bold border-b-2 transition ${activeTab==='wallet' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}>Earnings</button>
        </div>

        <div className="p-4">
            {activeTab === 'wallet' ? (
                <RiderWallet deliveries={completedDeliveries} />
            ) : (
                <div className="space-y-6">
                    {/* Active Jobs Section */}
                    {myActiveJobs.length > 0 && (
                        <div className="animate-in slide-in-from-top-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Current Trip</h3>
                            {myActiveJobs.map(job => (
                                <div key={job.id} className="bg-orange-600 text-white p-5 rounded-2xl shadow-xl shadow-orange-500/20 mb-4 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-xl">{job.productName}</h3>
                                            <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">#{job.id.slice(0,4)}</span>
                                        </div>
                                        
                                        <div className="space-y-3 mb-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                <span className="opacity-90">Pickup: <b>{job.vendorName || "Vendor"}</b></span>
                                            </div>
                                            <div className="border-l border-dashed border-white/30 h-3 ml-1"></div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-orange-200 rounded-full"></div>
                                                <span className="opacity-90">Dropoff: <b>{job.userEmail || "Customer"}</b></span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => openNavigation(job.vendorAddress || "Lagos")} 
                                                className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold text-sm backdrop-blur-md transition flex items-center justify-center gap-2"
                                            >
                                                <NavIcon /> Map
                                            </button>
                                            <button 
                                                onClick={() => completeJob(job.id)} 
                                                className="flex-1 bg-white text-orange-600 hover:bg-gray-50 py-3 rounded-xl font-bold text-sm shadow-md transition"
                                            >
                                                Delivered
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Available Jobs Section */}
                    <div>
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <h3 className="text-xs font-bold text-gray-400 uppercase">New Requests</h3>
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{availableDeliveries.length} nearby</span>
                        </div>
                        
                        {availableDeliveries.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                <p className="text-sm">No orders ready for pickup.</p>
                                <p className="text-xs opacity-50 mt-1">Searching area...</p>
                            </div>
                        ) : (
                            availableDeliveries.map(job => (
                                <div key={job.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-3 hover:border-orange-200 transition">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-lg dark:text-white">{job.productName}</h4>
                                            <p className="text-xs text-gray-500">{job.vendorName}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-green-600 dark:text-green-400">₦{(job.deliveryFee || 500).toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-400 uppercase">Earnings</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{job.vendorDistance || "2.5km"}</span>
                                        <span>•</span>
                                        <span>{job.quantity || 1} Items</span>
                                    </div>

                                    <button 
                                        onClick={() => acceptJob(job.id)} 
                                        className="w-full py-3 bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-gray-200 dark:shadow-none"
                                    >
                                        Accept Delivery
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
        
        <button onClick={onBack} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-6 py-2 rounded-full text-xs font-bold shadow-lg border border-gray-200 dark:border-gray-700 text-red-500 hover:bg-red-50 transition">
            Log Out
        </button>
    </div>
  );
}