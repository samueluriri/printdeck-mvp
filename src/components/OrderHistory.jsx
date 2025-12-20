import React, { useEffect, useState } from 'react';
// FIX: Using standard import
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
// 1. IMPORT CHAT WINDOW
import ChatWindow from './ChatWindow';

export default function OrderHistory({ user, onBack, onTrackOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'
  
  // CALL UI STATE
  const [callModal, setCallModal] = useState(null); // { orderId, vendorName, phone, target, mode }
  const [callTimer, setCallTimer] = useState(0);
  
  // 2. STATE FOR CHAT
  const [chatOrder, setChatOrder] = useState(null);

  // Call Timer Effect
  useEffect(() => {
    let interval;
    if (callModal?.mode === 'connected') {
      interval = setInterval(() => setCallTimer(c => c + 1), 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [callModal?.mode]);

  // Simulate Connection Delay
  useEffect(() => {
    if (callModal?.mode === 'calling') {
      const timeout = setTimeout(() => {
        setCallModal(prev => prev ? { ...prev, mode: 'connected' } : null);
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [callModal?.mode]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (!user) return;

    // Query orders for the current user, sorted by newest
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc") 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(allOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter orders based on status
  const activeOrders = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));
  
  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative">
      <button 
        onClick={onBack} 
        className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 font-medium"
      >
        ← Back to Shop
      </button>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h2>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button 
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'active' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          Ongoing ({activeOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`pb-2 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'past' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          History
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading your orders...</p>
      ) : displayOrders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No {activeTab === 'active' ? 'ongoing' : 'past'} orders found.</p>
          {activeTab === 'active' && (
            <button onClick={onBack} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">
              Start Printing
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {displayOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-300">{order.productName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ordered on {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                  ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'Printing' ? 'bg-blue-100 text-blue-800' : 
                    order.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'Ready for Pickup' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex justify-between items-end border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Shop: <span className="font-semibold text-gray-900 dark:text-gray-300">{order.vendorName || "Unknown Shop"}</span></p>
                  <p>Quantity: {order.quantity}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    ₦{order.totalPrice?.toLocaleString()}
                  </div>
                  
                  {/* Actions Row */}
                  {activeTab === 'active' && (
                    <div className="flex gap-2 mt-1">
                      {/* Call Button */}
                      <button 
                        onClick={() => setCallModal({
                          orderId: order.id,
                          vendorName: order.vendorName,
                          phone: order.vendorPhone || '08000000000',
                          target: order.status === 'Out for Delivery' ? 'Rider' : 'Shop',
                          mode: 'select'
                        })}
                        className="text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1"
                      >
                        <span>📞</span> Call
                      </button>

                      {/* 3. CHAT BUTTON */}
                      <button 
                        onClick={() => setChatOrder(order)}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full font-semibold hover:bg-gray-200 transition flex items-center gap-1"
                      >
                        <span>💬</span> Chat
                      </button>

                      {/* Track Button */}
                      <button 
                        onClick={() => onTrackOrder(order)}
                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-indigo-700 transition flex items-center gap-1 shadow-sm"
                      >
                        <span>📍</span> Track Live
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CALL MODAL OVERLAY */}
      {callModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          
          {/* 1. SELECTION SCREEN */}
          {callModal.mode === 'select' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-xs animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contact {callModal.target}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose how you want to call <b>{callModal.vendorName}</b>.</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setCallModal({ ...callModal, mode: 'calling' })}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition text-left"
                >
                  <span className="font-bold flex items-center gap-3">
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs">🌐</span>
                    In-App Internet Call
                  </span>
                  <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-sm text-gray-600 dark:text-gray-300">Free</span>
                </button>

                <a 
                  href={`tel:${callModal.phone}`}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300 text-left"
                >
                  <span className="font-bold flex items-center gap-3">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full w-8 h-8 flex items-center justify-center text-xs">📱</span>
                    Mobile Network Call
                  </span>
                </a>
              </div>

              <button 
                onClick={() => setCallModal(null)}
                className="w-full mt-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          )}

          {/* 2. IN-APP CALL INTERFACE */}
          {(callModal.mode === 'calling' || callModal.mode === 'connected') && (
            <div className="bg-gray-900 text-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden flex flex-col h-[450px] relative border border-gray-800">
              {/* Background Effect */}
              <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-indigo-500 to-purple-900"></div>
              
              <div className="flex-grow flex flex-col items-center justify-center z-10 p-6 text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full mb-6 flex items-center justify-center text-4xl shadow-xl border-4 border-gray-700">
                  {callModal.target === 'Rider' ? '🛵' : '🏪'}
                </div>
                <h3 className="text-2xl font-bold mb-2">{callModal.vendorName}</h3>
                <p className="text-indigo-200 text-sm font-medium animate-pulse">
                  {callModal.mode === 'calling' ? 'Connecting...' : formatTime(callTimer)}
                </p>
              </div>

              {/* Call Controls */}
              <div className="p-8 pb-10 flex justify-around items-center z-10 bg-gray-800/80 backdrop-blur-md border-t border-gray-700">
                <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition text-white/80">
                  🔇
                </button>
                <button 
                  onClick={() => setCallModal(null)}
                  className="p-5 rounded-full bg-red-600 hover:bg-red-500 transition shadow-lg shadow-red-900/50 transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 0 1 0-1.41C2.74 9.06 7.17 7.5 12 7.5s9.27 1.55 11.71 4.17c.39.39.39 1.03 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.66-1.85.995.995 0 0 1-.57-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
                </button>
                <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition text-white/80">
                  🔊
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. RENDER CHAT MODAL */}
      {chatOrder && (
        <ChatWindow 
          order={chatOrder} 
          user={user} 
          onClose={() => setChatOrder(null)} 
        />
      )}
    </div>
  );
}