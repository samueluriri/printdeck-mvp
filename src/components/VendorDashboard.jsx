import React, { useEffect, useState } from 'react';
// FIX: Reverted to standard import to satisfy build tool
import { db } from '../firebase';
import { collection, onSnapshot, query, doc, updateDoc, getDocs } from 'firebase/firestore';

export default function VendorDashboard({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Initializing...");
  // NEW: Tab state
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'history'

  const processOrders = (docs) => {
    try {
      const ordersList = docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort newest first
      ordersList.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      return ordersList;
    } catch (err) {
      console.error("Processing Error:", err);
      return [];
    }
  };

  useEffect(() => {
    setStatusMsg("Connecting...");
    const q = query(collection(db, "orders"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const processed = processOrders(snapshot.docs);
      setOrders(processed);
      setLoading(false);
      setStatusMsg("Connected");
    });
    return () => unsubscribe();
  }, []);

  const markReady = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "Ready for Pickup" });
      alert("Order marked as Ready!");
    } catch (e) {
      alert(`Failed to update: ${e.message}`);
    }
  };

  // FILTER LOGIC
  // Live: Everything active (Pending, Printing, Ready, Out for Delivery)
  const liveOrders = orders.filter(o => 
    !['Completed', 'Cancelled'].includes(o.status)
  );
  
  // History: Completed or Cancelled
  const historyOrders = orders.filter(o => 
    ['Completed', 'Cancelled'].includes(o.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h2>
          <p className="text-sm text-gray-500">Manage your print queue</p>
        </div>
        <button onClick={onBack} className="text-gray-600 font-medium px-4 py-2 border rounded-lg hover:bg-gray-50 bg-white">
          Exit Dashboard
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('live')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'live' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Live Queue ({liveOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Order History
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading orders...</p>
      ) : activeTab === 'live' ? (
        // LIVE ORDERS VIEW
        <div className="grid gap-4">
          {liveOrders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg text-indigo-900">{order.productName}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.status === 'Ready for Pickup' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                </div>
                <p className="text-sm text-gray-600"><span className="font-bold">{order.quantity} units</span> • {order.paperType}</p>
                <div className="text-xs text-gray-400 mt-1">
                  <p>ID: {order.id}</p>
                  <p>Ref: {order.paymentRef || "N/A"}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-xl font-bold text-gray-800">₦{order.totalPrice?.toLocaleString()}</p>
                {order.status === "Pending" && (
                  <button onClick={() => markReady(order.id)} className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded shadow hover:bg-indigo-700 transition">Mark Ready</button>
                )}
                {order.status === "Ready for Pickup" && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Waiting for Rider...</span>}
                {order.status === "Out for Delivery" && <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">Rider on the way</span>}
              </div>
            </div>
          ))}
          {liveOrders.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No active orders.</p>
              <p className="text-sm text-gray-400">New orders will appear here instantly.</p>
            </div>
          )}
        </div>
      ) : (
        // HISTORY VIEW
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                    <div className="text-xs text-gray-500">{order.quantity} units</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ₦{order.totalPrice?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {historyOrders.length === 0 && <div className="p-8 text-center text-gray-500">No completed orders yet.</div>}
        </div>
      )}
    </div>
  );
}