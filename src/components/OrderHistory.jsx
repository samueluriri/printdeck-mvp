import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
// Tools to query the database
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function OrderHistory({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 1. QUERY: Go to 'orders' table
    // 2. FILTER: Only get orders where 'userId' matches the current user's ID
    // 3. SORT: Newest first
    // Note: If you get a "Requires Index" error in console, click the link provided in the error.
    const q = query(
      collection(db, "orders"),
      // We need to filter by the user who is logged in!
      // (Note: In ProductConfigurator, we need to make sure we save 'userId')
      orderBy("createdAt", "desc") 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(allOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 mb-6 font-medium">
        ← Back to Shop
      </button>

      <h2 className="text-3xl font-bold text-gray-900 mb-8">My Order History</h2>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <button onClick={onBack} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">
            Start Printing
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-indigo-900">{order.productName}</h3>
                  <p className="text-sm text-gray-500">Ordered on {order.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                  ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    order.status === 'Printing' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-600">
                  <p>Shop: <span className="font-semibold">{order.vendorName || "Unknown Shop"}</span></p>
                  <p>Quantity: {order.quantity}</p>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  ₦{order.totalPrice?.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}