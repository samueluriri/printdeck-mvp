import React, { useEffect, useState } from 'react';
// FIX: Using standard import
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function OrderHistory({ user, onBack, onTrackOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'

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
    <div className="max-w-4xl mx-auto py-8 px-4">
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
                      {/* Call Button - Toggles between Rider/Vendor based on status */}
                      <a 
                        href={`tel:${order.vendorPhone || '08000000000'}`} 
                        className="text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1"
                      >
                        <span>📞</span> Call {order.status === 'Out for Delivery' ? 'Rider' : 'Shop'}
                      </a>

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
    </div>
  );
}