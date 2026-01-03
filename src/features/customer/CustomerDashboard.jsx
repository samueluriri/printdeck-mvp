import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, onSnapshot, doc, addDoc, serverTimestamp, where, orderBy } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";

// --- INSTRUCTIONS FOR LOCAL USE ---
// If you have created src/config/firebase.js locally, uncomment the line below 
// and delete the "Firebase Initialization" block that follows.
// import { db, auth } from '../../config/firebase';

// --- Firebase Initialization (Self-Contained for Preview) ---
let app, db, auth;
try {
  const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
  // Robust check to prevent double-initialization
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
const BikeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>;
const WalkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4v6m-2-3l5 4s-1 6-5 6m5-6h-6m5-6a2 2 0 1 0-4 0 2 2 0 0 0 4 0"/></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

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
      description: `Order: ${o.productName || o.fileName}`
    }))
  ].sort((a, b) => b.createdAt - a.createdAt);

  const balance = deposits.reduce((acc, d) => acc + d.amount, 0) - orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const displayBalance = Math.max(0, balance); 

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        {/* Customer Wallet Card */}
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

// --- CreateOrder Component ---
const CreateOrder = ({ user, onClose }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [config, setConfig] = useState({
        copies: 1,
        color: 'bw', // bw or color
        paperType: 'A4',
        deliveryMethod: 'pickup', // pickup or delivery
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pricing Constants
    const PRICE_BW = 50;
    const PRICE_COLOR = 200;
    const DELIVERY_FEE = 500;

    const calculateTotal = () => {
        const printCost = config.copies * (config.color === 'bw' ? PRICE_BW : PRICE_COLOR);
        const deliveryCost = config.deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
        return printCost + deliveryCost;
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!user || !db) return;
        setIsSubmitting(true);
        
        try {
            // Use dummy URL for testing printer
            const mockUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"; 
            
            await addDoc(collection(db, "orders"), {
                userId: user.uid,
                userEmail: user.email || "Guest",
                fileName: file ? file.name : "Document.pdf",
                fileUrl: mockUrl,
                status: "Paid", // Triggers printer bot
                createdAt: serverTimestamp(),
                
                paperType: config.paperType,
                color: config.color,
                quantity: config.copies,
                
                deliveryMethod: config.deliveryMethod,
                deliveryFee: config.deliveryMethod === 'delivery' ? DELIVERY_FEE : 0,
                address: config.deliveryMethod === 'delivery' ? config.address : "Pick Up @ Shop",
                
                totalPrice: calculateTotal(),
                paymentRef: `PAY-${Date.now()}`
            });

            alert("Order Placed Successfully! Your printer should start soon.");
            onClose();
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-bold text-lg dark:text-white">New Print Order</h3>
                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8">✕</button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Step 1: File Upload */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Upload Document</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition bg-gray-50 dark:bg-gray-800/50">
                            <input type="file" id="file-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                    <UploadIcon />
                                </div>
                                <span className="font-bold text-gray-700 dark:text-gray-200">{file ? file.name : "Click to Upload PDF"}</span>
                                <span className="text-xs text-gray-400">Max size 10MB</span>
                            </label>
                        </div>
                    </div>

                    {/* Step 2: Settings */}
                    <div className="mb-8">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 border rounded-xl dark:border-gray-700">
                                <span className="text-xs text-gray-500 block">Copies</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <button onClick={() => setConfig({...config, copies: Math.max(1, config.copies-1)})} className="w-6 h-6 bg-gray-200 rounded text-gray-700">-</button>
                                    <span className="font-bold dark:text-white">{config.copies}</span>
                                    <button onClick={() => setConfig({...config, copies: config.copies+1})} className="w-6 h-6 bg-gray-200 rounded text-gray-700">+</button>
                                </div>
                            </div>
                            <div className="p-3 border rounded-xl dark:border-gray-700">
                                <span className="text-xs text-gray-500 block">Color Mode</span>
                                <div className="flex gap-2 mt-1">
                                    <button onClick={() => setConfig({...config, color: 'bw'})} className={`px-2 py-1 text-xs rounded border ${config.color === 'bw' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>B&W</button>
                                    <button onClick={() => setConfig({...config, color: 'color'})} className={`px-2 py-1 text-xs rounded border ${config.color === 'color' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Color</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Delivery Method */}
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">3. Delivery Method</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setConfig({...config, deliveryMethod: 'pickup'})}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${config.deliveryMethod === 'pickup' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <WalkIcon />
                                <span className="font-bold text-sm dark:text-white">Pick Up</span>
                                <span className="text-xs text-green-600 font-bold">Free</span>
                            </button>
                            <button 
                                onClick={() => setConfig({...config, deliveryMethod: 'delivery'})}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${config.deliveryMethod === 'delivery' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <BikeIcon />
                                <span className="font-bold text-sm dark:text-white">Delivery</span>
                                <span className="text-xs text-gray-500">+₦{DELIVERY_FEE}</span>
                            </button>
                        </div>
                        {config.deliveryMethod === 'delivery' && (
                            <div className="mt-4 animate-in slide-in-from-top-2">
                                <label className="text-xs text-gray-500">Delivery Address</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Hostel or Building Name..." 
                                    className="w-full p-3 border rounded-lg mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    value={config.address}
                                    onChange={(e) => setConfig({...config, address: e.target.value})}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₦{calculateTotal().toLocaleString()}</p>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        disabled={!file || isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? "Processing..." : "Pay & Print"}
                    </button>
                </div>
            </div>
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
  const [showNewOrder, setShowNewOrder] = useState(false);

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PrintDeck</h1>
            <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-red-500">Log Out</button>
        </div>

        {/* Primary Action */}
        <div className="mb-8">
            <button 
                onClick={() => setShowNewOrder(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 transition transform active:scale-[0.98]"
            >
                <PlusIcon /> Place New Order
            </button>
        </div>

        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
            <button onClick={() => setActiveTab('orders')} className={`pb-3 px-1 font-bold text-sm border-b-2 transition ${activeTab==='orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>My Orders</button>
            <button onClick={() => setActiveTab('wallet')} className={`pb-3 px-1 font-bold text-sm border-b-2 transition flex items-center gap-2 ${activeTab==='wallet' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
                <WalletIcon /> Wallet
            </button>
        </div>

        {/* Content */}
        {activeTab === 'orders' ? (
            <div className="space-y-4">
                {loading ? <p className="text-gray-500 text-center py-10">Loading orders...</p> : orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500">No active orders.</p>
                        <button onClick={() => setShowNewOrder(true)} className="text-blue-600 font-bold text-sm mt-2">Start your first print</button>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.deliveryMethod === 'pickup' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {order.deliveryMethod === 'pickup' ? <WalkIcon /> : <BikeIcon />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{order.fileName || "Document"}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{order.quantity} Copies</span>
                                        <span>•</span>
                                        <span className="uppercase">{order.deliveryMethod}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase mb-1 inline-block ${
                                    order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'Printing' ? 'bg-purple-100 text-purple-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>{order.status}</span>
                                <p className="font-bold text-gray-900 dark:text-white">₦{order.totalPrice?.toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        ) : (
            <CustomerWallet orders={orders} user={currentUser} />
        )}

        {/* Modal */}
        {showNewOrder && <CreateOrder user={currentUser} onClose={() => setShowNewOrder(false)} />}
    </div>
  );
}