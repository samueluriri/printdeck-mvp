import React, { useEffect, useState } from 'react';
// --- NEW IMPORT: Pointing to the central config we created ---
import { db, auth } from '../../config/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";

import { Eye, EyeOff, Wallet, ArrowDownLeft, ArrowUpRight, Landmark, MessageSquare, Check, Clock, Package, TrendingUp } from 'lucide-react';


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
    <div className="space-y-8 animate-fade-in-up">

      {/* Premium Wallet Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 text-white shadow-2xl transition-transform hover:scale-[1.01] duration-300 group">
        {/* Abstract Background Art */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-zinc-800/50 blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity"></div>

        <div className="relative z-10 p-10 flex flex-col justify-between min-h-[280px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-[10px] font-mono-tech uppercase tracking-[0.2em] mb-2">Total Balance</p>
              <div className="flex items-center gap-4">
                <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
                  {showBalance ? `₦${currentBalance.toLocaleString()}` : '••••••••'}
                </h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 rounded-full hover:bg-white/10 text-zinc-400 transition"
                >
                  {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-[10px] font-mono-tech font-bold text-emerald-400 uppercase tracking-widest">Protocol Tier 1</span>
            </div>
          </div>

          <div className="flex items-end justify-between mt-12">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-zinc-500 font-mono-tech uppercase tracking-wider">Monthly Revenue</span>
              <span className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                <TrendingUp size={16} /> +₦{totalEarnings.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="bg-white text-zinc-900 px-8 py-4 rounded-2xl font-mono-tech text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition shadow-lg active:scale-95 flex items-center gap-3"
            >
              <Landmark size={16} />
              Withdraw Funds
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="font-display text-xl font-bold text-zinc-900">Transaction History</h3>
          <button className="text-xs font-mono-tech text-zinc-500 uppercase tracking-widest hover:text-zinc-900 border-b border-zinc-200 hover:border-zinc-900 transition-colors">View Statement</button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center text-zinc-400">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <Wallet size={24} className="opacity-50" />
              </div>
              <p className="font-mono-tech text-xs uppercase tracking-widest">No wallet activity recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {transactions.map((txn) => (
                <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-zinc-50/50 transition group cursor-default">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors border ${txn.type === 'credit'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-zinc-50 border-zinc-100 text-zinc-400'
                      }`}>
                      {txn.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 text-sm md:text-base mb-1">{txn.description}</p>
                      <p className="font-mono-tech text-[10px] text-zinc-400 uppercase tracking-wider">{txn.createdAt.toDateString()} • {txn.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display font-bold text-lg md:text-xl ${txn.type === 'credit' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                      {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                    </p>
                    <span className={`text-[10px] font-mono-tech font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-1 ${txn.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
        <div className="fixed inset-0 bg-zinc-900/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-8 shadow-2xl">
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-8 sm:hidden"></div>

            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-display font-bold text-zinc-900">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleWithdraw}>
              <div className="bg-zinc-50 rounded-2xl p-6 mb-6 border border-zinc-100">
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-mono-tech font-bold text-zinc-500 uppercase tracking-widest">Amount to withdraw</label>
                  <span className="text-xs text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => setWithdrawAmount(currentBalance)}>Max: ₦{currentBalance.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-3xl text-zinc-300 font-display font-medium">₦</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full text-4xl font-display font-bold bg-transparent text-zinc-900 focus:outline-none placeholder-zinc-200"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="text-[10px] font-mono-tech font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Destination Account</label>
                <div className="flex items-center gap-4 p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:border-zinc-900 hover:bg-zinc-50 transition group">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-xs group-hover:scale-110 transition-transform">GT</div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Guaranty Trust Bank</p>
                    <p className="text-xs text-zinc-500 font-mono-tech">012****789</p>
                  </div>
                  <div className="ml-auto">
                    <Check size={16} className="text-zinc-900" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-zinc-900 text-white font-mono-tech text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-black transition shadow-xl active:scale-95 flex items-center justify-center gap-2">
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
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.senderId === user.uid
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
export default function VendorDashboard({ onBack = () => { }, user }) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-zinc-900 tracking-tight">Vendor Dashboard</h2>
          <p className="text-zinc-500 mt-1 font-sans">Manage your print operations in real-time</p>
        </div>
        <button onClick={onBack} className="text-xs font-mono-tech uppercase tracking-widest px-6 py-3 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-900 transition-colors shadow-sm flex items-center gap-3 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to App
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-100 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('live')}
          className={`pb-4 px-2 font-mono-tech text-xs font-bold uppercase tracking-widest border-b-2 transition flex items-center gap-3 whitespace-nowrap ${activeTab === 'live' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
        >
          Live Queue
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'live' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
            {liveOrders.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-2 font-mono-tech text-xs font-bold uppercase tracking-widest border-b-2 transition whitespace-nowrap ${activeTab === 'history' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
        >
          Order History
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`pb-4 px-2 font-mono-tech text-xs font-bold uppercase tracking-widest border-b-2 transition flex items-center gap-2 whitespace-nowrap ${activeTab === 'wallet' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
        >
          <Wallet size={14} />
          Wallet
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
            <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400 font-mono-tech text-xs uppercase tracking-widest">Compiling Data...</p>
          </div>
        ) : activeTab === 'wallet' ? (
          <WalletView historyOrders={historyOrders} />
        ) : activeTab === 'live' ? (
          <div className="grid gap-6">
            {liveOrders.map((order) => (
              <div key={order.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100 flex flex-col md:flex-row justify-between gap-8 transition-all hover:shadow-xl hover:border-zinc-200 group">
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <h3 className="font-display font-bold text-2xl text-zinc-900">{order.productName || "Untitled Order"}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono-tech font-bold uppercase tracking-widest ${order.status === 'Ready for Pickup' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                      }`}>
                      {order.status || "Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                    <p className="text-zinc-500"><span className="font-bold text-zinc-900">Quantity:</span> {order.quantity || 1}</p>
                    <p className="text-zinc-500"><span className="font-bold text-zinc-900">Type:</span> {order.paperType || "Standard"}</p>
                    <p className="col-span-2 text-[10px] font-mono-tech text-zinc-400 mt-2 uppercase">Ref: {order.paymentRef || "N/A"} • ID: {order.id.slice(0, 8)}...</p>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-6 border-t md:border-t-0 border-zinc-50 pt-6 md:pt-0 pl-0 md:pl-8 md:border-l md:border-zinc-100">
                  <div className="text-right">
                    <p className="text-[10px] font-mono-tech text-zinc-400 uppercase tracking-wider mb-1">Total Value</p>
                    <p className="text-3xl font-display font-bold text-zinc-900">₦{(order.totalPrice || 0).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 w-full">
                    <button
                      onClick={() => setChatOrder(order)}
                      className="bg-white border border-zinc-200 text-zinc-700 text-xs font-mono-tech font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-zinc-50 hover:border-zinc-900 transition flex items-center gap-2"
                    >
                      <MessageSquare size={14} /> Chat
                    </button>

                    {order.status === "Pending" && (
                      <button onClick={() => markReady(order.id)} className="bg-zinc-900 text-white text-xs font-mono-tech font-bold uppercase tracking-widest px-8 py-3 rounded-xl shadow-lg hover:bg-black hover:shadow-xl transition active:scale-95 flex items-center gap-2">
                        <Check size={14} /> Mark Ready
                      </button>
                    )}
                  </div>

                  {order.status === "Ready for Pickup" && (
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      Waiting for rider
                    </div>
                  )}
                </div>
              </div>
            ))}

            {liveOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 bg-zinc-50 rounded-[2rem] border border-zinc-200 text-center px-4 border-dashed">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Package size={32} className="text-zinc-300" />
                </div>
                <h3 className="text-xl font-display font-bold text-zinc-900 mb-2">Queue Empty</h3>
                <p className="text-zinc-500 max-w-sm mx-auto">There are no pending orders in the queue. New jobs will appear here automatically.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-400 text-[10px] font-mono-tech uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5 font-bold">Product</th>
                    <th className="px-8 py-5 font-bold">Date</th>
                    <th className="px-8 py-5 font-bold text-right">Amount</th>
                    <th className="px-8 py-5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {historyOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-8 py-5 font-bold text-zinc-900">{order.productName}</td>
                      <td className="px-8 py-5 text-zinc-500 font-mono-tech text-xs">{formatDate(order.createdAt)}</td>
                      <td className="px-8 py-5 text-right font-bold text-zinc-900">₦{(order.totalPrice || 0).toLocaleString()}</td>
                      <td className="px-8 py-5 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono-tech font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {historyOrders.length === 0 && <div className="p-16 text-center text-zinc-400 font-mono-tech text-xs uppercase tracking-widest">No completed orders found in history.</div>}
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