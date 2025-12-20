import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, onSnapshot, doc, addDoc, serverTimestamp, where, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";

// --- Firebase Initialization ---
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
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const ArrowUpRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>;
const ArrowDownLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>;

// --- Customer Wallet Component ---
const CustomerWallet = ({ orders, user }) => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState("");
  const [deposits, setDeposits] = useState([]);

  // Mock Top Up
  const handleTopUp = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    
    const newDeposit = {
      id: `dep-${Date.now()}`,
      type: 'credit',
      amount: val,
      status: 'Success',
      createdAt: new Date(),
      description: 'Wallet Funding'
    };
    setDeposits([newDeposit, ...deposits]);
    setAmount("");
    setShowTopUp(false);
  };

  // Merge deposits (credits) and Orders (debits)
  const transactions = [
    ...deposits,
    ...orders.map(o => ({
      id: o.id,
      type: 'debit',
      amount: o.totalPrice || 0,
      status: 'Completed',
      createdAt: o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt?.seconds * 1000 || Date.now()),
      description: `Order: ${o.productName}`
    }))
  ].sort((a, b) => b.createdAt - a.createdAt);

  const balance = deposits.reduce((acc, d) => acc + d.amount, 0) - orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  // Ensure balance doesn't show negative for demo if orders exist before funding
  const displayBalance = Math.max(0, balance); 

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        {/* Customer Wallet Card - Vibrant & Friendly */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl p-8 transition-transform hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold border border-white/10">Standard Plan</span>
                    <WalletIcon />
                </div>
                
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide mb-1">Available to Spend</p>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-8">₦{displayBalance.toLocaleString()}</h2>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowTopUp(true)}
                        className="flex-1 bg-white text-blue-600 py-3.5 px-6 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg flex items-center justify-center gap-2"
                    >
                        <PlusIcon /> Fund Wallet
                    </button>
                    <button className="px-6 py-3.5 rounded-xl font-bold bg-blue-700/50 hover:bg-blue-700/70 border border-white/20 backdrop-blur-sm transition">
                        Scan to Pay
                    </button>
                </div>
            </div>
        </div>

        {/* Transactions */}
        <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Activity</h3>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {transactions.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No recent wallet activity.</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transactions.map(txn => (
                            <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {txn.type === 'credit' ? <ArrowDownLeft /> : <ArrowUpRight />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{txn.description}</p>
                                        <p className="text-xs text-gray-500">{txn.createdAt.toDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                        {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Top Up Modal */}
        {showTopUp && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fund Wallet</h3>
                        <button onClick={() => setShowTopUp(false)} className="text-gray-400">✕</button>
                    </div>
                    <form onSubmit={handleTopUp}>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount to add</label>
                            <input 
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                className="w-full text-3xl font-bold border-b-2 border-gray-200 dark:border-gray-700 py-2 bg-transparent dark:text-white focus:outline-none focus:border-blue-600"
                                placeholder="0.00" autoFocus 
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {[1000, 5000, 10000].map(val => (
                                <button key={val} type="button" onClick={() => setAmount(val)} className="py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    ₦{val.toLocaleString()}
                                </button>
                            ))}
                        </div>
                        <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700">Pay with Card</button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

// --- Main Customer Component ---
export default function CustomerDashboard({ onBack = () => {}, user }) {
  const [internalUser, setInternalUser] = useState(null);
  const currentUser = user || internalUser;
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth & Data Fetching (Similar robust pattern as Vendor)
  useEffect(() => {
    if(!auth) return;
    const init = async () => {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
             try { await signInWithCustomToken(auth, __initial_auth_token); } catch(e) { await signInAnonymously(auth); }
        } else { await signInAnonymously(auth); }
    };
    init();
    const unsub = onAuthStateChanged(auth, setInternalUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser || !db) return;
    // For demo, fetching all orders, typically would filter by user.uid
    const q = query(collection(db, "orders"));
    const unsub = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
        // Sort
        list.sort((a,b) => {
            const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt||0).getTime();
            const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt||0).getTime();
            return tb - ta;
        });
        setOrders(list);
        setLoading(false);
    });
    return () => unsub();
  }, [currentUser]);

  if (!db || !currentUser) return <div className="p-10 text-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto"></div></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Account</h1>
            <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">Log Out</button>
        </div>

        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-8">
            <button onClick={() => setActiveTab('orders')} className={`pb-3 px-1 font-bold text-sm border-b-2 transition ${activeTab==='orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>My Orders</button>
            <button onClick={() => setActiveTab('wallet')} className={`pb-3 px-1 font-bold text-sm border-b-2 transition flex items-center gap-2 ${activeTab==='wallet' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
                <WalletIcon /> Wallet
            </button>
        </div>

        {activeTab === 'wallet' ? (
            <CustomerWallet orders={orders} user={currentUser} />
        ) : (
            <div className="space-y-4">
                {loading ? <p className="text-gray-500">Loading...</p> : orders.map(order => (
                    <div key={order.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm">
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{order.productName}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                                order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>{order.status}</span>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">₦{order.totalPrice?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt?.seconds*1000 || Date.now()).toDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}