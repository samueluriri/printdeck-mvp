import React, { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
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

// --- Icons (SVGs) ---
const EyeIcon = ({ visible }) => (
  visible ? 
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> :
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
);

const ArrowDownLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>
);

const ArrowUpRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
);

const BankIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21v-7"/><path d="M19 21v-7"/><path d="M10 21v-4a2 2 0 1 1 4 0v4"/><path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 1 0-14 0H3a9 9 0 0 1 9-9Z"/></svg>
);

// --- Wallet Component ---
const WalletView = ({ historyOrders }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Calculate balance based on completed orders (Mock calculation for demonstration)
  const totalEarnings = historyOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  
  // Mock withdrawals state
  const [withdrawals, setWithdrawals] = useState([]);

  const currentBalance = totalEarnings - withdrawals.reduce((acc, w) => acc + w.amount, 0);

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return alert("Please enter a valid amount");
    if (amount > currentBalance) return alert("Insufficient funds");

    // Add to local mock state
    const newWithdrawal = {
      id: `wd-${Date.now()}`,
      type: 'debit',
      amount: amount,
      status: 'Pending',
      createdAt: new Date(),
      description: 'Transfer to Access Bank'
    };
    
    setWithdrawals([newWithdrawal, ...withdrawals]);
    setWithdrawAmount("");
    setShowWithdrawModal(false);
  };

  // Merge orders (credits) and withdrawals (debits) for the transaction list
  const transactions = [
    ...withdrawals,
    ...historyOrders.map(o => ({
      id: o.id,
      type: 'credit',
      amount: o.totalPrice || 0,
      status: 'Completed',
      createdAt: o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt?.seconds * 1000 || Date.now()),
      description: `Payment for ${o.productName}`
    }))
  ].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl transition-transform hover:scale-[1.01] duration-300">
        {/* Abstract Background Art */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 blur-[80px] opacity-60"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[200px] w-[200px] rounded-full bg-blue-600 blur-[60px] opacity-40"></div>
        
        <div className="relative z-10 p-8 flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-300 text-sm font-medium tracking-wide uppercase mb-1">Total Balance</p>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {showBalance ? `₦${currentBalance.toLocaleString()}` : '••••••••'}
                </h2>
                <button 
                  onClick={() => setShowBalance(!showBalance)} 
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 transition"
                >
                  <EyeIcon visible={showBalance} />
                </button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <span className="text-xs font-bold text-indigo-200">VENDOR TIER 1</span>
            </div>
          </div>

          <div className="flex items-end justify-between mt-8">
            <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Monthly Earnings</span>
                <span className="text-lg font-semibold text-green-400">+₦{totalEarnings.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition shadow-lg active:scale-95 flex items-center gap-2"
            >
              <BankIcon />
              Withdraw Funds
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Transaction History</h3>
            <button className="text-sm text-indigo-600 font-semibold hover:text-indigo-700">View Statement</button>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-gray-500">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <WalletIcon />
                </div>
                <p>No transactions yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((txn) => (
                <div key={txn.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        txn.type === 'credit' 
                        ? 'bg-green-50 text-green-600 group-hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-50 text-red-600 group-hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {txn.type === 'credit' ? <ArrowDownLeft /> : <ArrowUpRight />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{txn.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{txn.createdAt.toDateString()} • {txn.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm md:text-base ${txn.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        txn.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                    }`}>
                        {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-12 duration-300">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden"></div>
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            
            <form onSubmit={handleWithdraw}>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Amount to withdraw</label>
                    <span className="text-xs text-indigo-600 font-bold cursor-pointer" onClick={() => setWithdrawAmount(currentBalance)}>Max: ₦{currentBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                      <span className="text-2xl text-gray-400 font-semibold">₦</span>
                      <input 
                        type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full text-3xl font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-200"
                        placeholder="0"
                        autoFocus
                      />
                  </div>
              </div>

              <div className="mb-6">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Destination Account</label>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-indigo-500 transition">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">GT</div>
                      <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Guaranty Trust Bank</p>
                          <p className="text-xs text-gray-500">012****789</p>
                      </div>
                  </div>
              </div>
              
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2">
                Confirm Withdrawal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Internal ChatWindow Component ---
const ChatWindow = ({ order, user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    if (!order?.id || !db) return;
    
    const q = query(collection(db, "orders", order.id, "messages"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      msgs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      });
      setMessages(msgs);
      setChatLoading(false);
    }, (err) => console.error("Chat Error:", err));
    
    return () => unsubscribe();
  }, [order?.id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !db) return;
    try {
      await addDoc(collection(db, "orders", order.id, "messages"), {
        text: newMessage,
        senderId: user.uid,
        senderName: "Vendor",
        createdAt: serverTimestamp()
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col h-[500px] border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-indigo-600 dark:bg-gray-900">
          <div>
            <h3 className="font-bold text-white text-lg">{order.productName}</h3>
            <p className="text-indigo-100 text-xs">Order #{order.id.slice(0, 6)}</p>
          </div>
          <button onClick={onClose} className="text-indigo-100 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
          {chatLoading ? (
             <div className="flex justify-center pt-10"><div className="w-6 h-6 border-2 border-indigo-600 rounded-full animate-spin border-t-transparent"></div></div>
          ) : messages.length === 0 ? (
             <div className="text-center text-gray-400 text-sm mt-10 flex flex-col items-center">
               <span className="text-2xl mb-2">💬</span>
               <p>No messages yet.</p>
               <p className="text-xs">Start the conversation with the customer.</p>
             </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.senderId === user.uid 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-700 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-600'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={sendMessage} className="p-3 border-t dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800 shadow-lg">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button type="submit" className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-700 transition shadow-sm disabled:opacity-50" disabled={!newMessage.trim()}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main VendorDashboard Component ---
export default function VendorDashboard({ onBack = () => {}, user }) { 
  const [internalUser, setInternalUser] = useState(null);
  const currentUser = user || internalUser;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('live'); 
  const [chatOrder, setChatOrder] = useState(null);

  useEffect(() => {
    if (!auth) {
        setAuthChecking(false);
        return;
    }
    const safetyTimeout = setTimeout(() => setAuthChecking(false), 5000);
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
          await signInWithCustomToken(auth, __initial_auth_token);
        } catch (e) {
          console.warn("Custom token auth failed", e);
          await signInAnonymously(auth);
        }
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setInternalUser(u);
        setAuthChecking(false);
        clearTimeout(safetyTimeout);
    });
    return () => {
        unsubscribe();
        clearTimeout(safetyTimeout);
    };
  }, []);

  const processOrders = (docs) => {
    try {
      const ordersList = docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      ordersList.sort((a, b) => {
        const getTime = (d) => {
            if (!d) return 0;
            if (d.toMillis) return d.toMillis();
            if (d.toDate) return d.toDate().getTime();
            return new Date(d).getTime();
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      return ordersList;
    } catch (err) {
      console.error("Processing Error:", err);
      return [];
    }
  };

  useEffect(() => {
    if (!currentUser || !db) return;
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const processed = processOrders(snapshot.docs);
      setOrders(processed);
      setLoading(false);
    }, (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const markReady = async (orderId) => {
    if (!db) return;
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "Ready for Pickup" });
    } catch (e) {
      console.error(`Failed to update: ${e.message}`);
    }
  };

  const formatDate = (val) => {
      if (!val) return "Date unknown";
      try {
          if (val.seconds) return new Date(val.seconds * 1000).toDateString();
          return new Date(val).toDateString();
      } catch (e) {
          return "Invalid Date";
      }
  };

  const liveOrders = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
  const historyOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));

  if (!db) return <div className="p-8 flex items-center justify-center text-red-500 bg-red-50 rounded-lg m-4">Database connection failed. Please refresh.</div>;
  
  if (authChecking) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 font-medium">Connecting securely...</p>
    </div>
  );

  if (!currentUser) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl">
        <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">Authentication Required</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Retry Connection</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative font-sans text-slate-800 dark:text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Vendor Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time order management</p>
        </div>
        <button onClick={onBack} className="text-sm font-medium px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors shadow-sm flex items-center gap-2">
          <span>←</span> Back to App
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('live')}
          className={`pb-3 px-1 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'live' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Live Queue 
          <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'live' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
            {liveOrders.length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Order History
        </button>
        <button 
          onClick={() => setActiveTab('wallet')}
          className={`pb-3 px-1 font-bold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'wallet' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <WalletIcon />
          Wallet
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Syncing orders...</p>
            </div>
        ) : activeTab === 'wallet' ? (
           <WalletView historyOrders={historyOrders} />
        ) : activeTab === 'live' ? (
            <div className="grid gap-4">
            {liveOrders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between gap-6 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 group">
                <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{order.productName || "Untitled Order"}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Ready for Pickup' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                        {order.status || "Pending"}
                    </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p><span className="font-semibold text-gray-900 dark:text-gray-200">Quantity:</span> {order.quantity || 1}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-200">Type:</span> {order.paperType || "Standard"}</p>
                        <p className="col-span-2 text-xs text-gray-400 mt-2 font-mono">Ref: {order.paymentRef || "N/A"} • ID: {order.id.slice(0, 8)}...</p>
                    </div>
                </div>
                
                <div className="flex flex-col items-end justify-between gap-4 border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-4 md:pt-0 pl-0 md:pl-4 md:border-l">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total Price</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₦{(order.totalPrice || 0).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-end gap-2 w-full">
                    <button 
                        onClick={() => setChatOrder(order)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                        <span>💬</span> Chat
                    </button>

                    {order.status === "Pending" && (
                        <button onClick={() => markReady(order.id)} className="bg-indigo-600 text-white text-sm font-bold px-5 py-2 rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow-md transition active:scale-95">
                            Mark Ready
                        </button>
                    )}
                    </div>
                    
                    {order.status === "Ready for Pickup" && (
                        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            Waiting for rider
                        </div>
                    )}
                </div>
                </div>
            ))}
            
            {liveOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center px-4">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-3xl">📦</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">All Caught Up!</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">There are no pending orders in the queue right now. New orders will pop up here automatically.</p>
                </div>
            )}
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Product</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold text-right">Amount</th>
                            <th className="px-6 py-4 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {historyOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.productName}</td>
                                <td className="px-6 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                                <td className="px-6 py-4 text-right font-medium">₦{(order.totalPrice || 0).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                        Completed
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {historyOrders.length === 0 && <div className="p-12 text-center text-gray-500">No completed orders found in history.</div>}
            </div>
        )}
      </div>

      {chatOrder && currentUser && (
        <ChatWindow 
          order={chatOrder} 
          user={currentUser} 
          onClose={() => setChatOrder(null)} 
        />
      )}
    </div>
  );
}