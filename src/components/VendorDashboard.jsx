import React, { useEffect, useState } from 'react';
// FIX: Explicitly added .js extension for reliable path resolution
import { db } from '../firebase.js';
import { collection, onSnapshot, query, doc, updateDoc, getDocs, addDoc } from 'firebase/firestore';

// Helper to sort and format orders (Moved outside component for stability)
const processOrders = (docs) => {
  try {
    const ordersList = docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    ordersList.sort((a, b) => {
      const getMillis = (item) => {
          if (!item.createdAt) return 0;
          // Handle Firestore Timestamp (has .toDate())
          if (typeof item.createdAt.toDate === 'function') return item.createdAt.toDate().getTime();
          // Handle JS Date object
          if (typeof item.createdAt.getTime === 'function') return item.createdAt.getTime(); 
          // Handle String/Number
          return new Date(item.createdAt).getTime(); 
      }
      return getMillis(b) - getMillis(a);
    });

    return ordersList;
  } catch (err) {
    console.error("Processing Error:", err);
    return [];
  }
};

export default function VendorDashboard({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Initializing...");
  const [projectId, setProjectId] = useState("Unknown");

  useEffect(() => {
    // Show which project we are connected to for debugging
    if (db && db.app && db.app.options) {
      setProjectId(db.app.options.projectId);
    }
  }, []);

  // DEBUG TOOL: Create a fake order to test connection
  const createTestOrder = async () => {
    try {
      setStatusMsg("Creating test order...");
      await addDoc(collection(db, "orders"), {
        productName: "TEST ORDER",
        vendorName: "Debug Mode",
        quantity: 1,
        totalPrice: 100,
        createdAt: new Date(),
        status: "Pending"
      });
      alert("Test Order Created! If you don't see it appear below instantly, check your Firebase Console.");
    } catch (e) {
      console.error("Test Order Failed:", e);
      alert(`Test Write Failed: ${e.message}`);
    }
  };

  const manualRefresh = async () => {
    setLoading(true);
    setStatusMsg("Manual refreshing...");
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      console.log("Manual Fetch Count:", querySnapshot.size);
      
      const processed = processOrders(querySnapshot.docs);
      setOrders(processed);
      setStatusMsg(`Loaded ${processed.length} orders manually.`);
    } catch (err) {
      console.error("Manual Fetch Error:", err);
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatusMsg("Connecting to real-time updates...");
    
    // Simple query to fetch all orders
    const q = query(collection(db, "orders"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStatusMsg(`Real-time active. Found ${snapshot.docs.length} docs.`);
      const processed = processOrders(snapshot.docs);
      setOrders(processed);
      setLoading(false);
    }, (error) => {
      console.error("VendorDashboard Error:", error);
      setStatusMsg(`Connection Error: ${error.message}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markReady = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Ready for Pickup"
      });
      alert("Order marked as Ready!");
    } catch (e) {
      console.error("Error updating status:", e);
      alert(`Failed to update: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h2>
          <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-100 p-2 rounded">
            <p>Status: {statusMsg}</p>
            <p>Project ID: {projectId}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={createTestOrder} 
            className="bg-yellow-100 text-yellow-800 font-medium px-3 py-1 rounded hover:bg-yellow-200 border border-yellow-300"
          >
            + Create Test Order
          </button>
          <button 
            onClick={manualRefresh} 
            className="text-indigo-600 font-medium border border-indigo-600 px-3 py-1 rounded hover:bg-indigo-50"
          >
            ↻ Force Refresh
          </button>
          <button onClick={onBack} className="text-gray-600 font-medium px-3 py-1">
            Exit
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading orders...</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg text-indigo-900">{order.productName}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    order.status === 'Ready for Pickup' ? 'bg-green-100 text-green-800' :
                    order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">{order.quantity} units</span> • {order.paperType}
                </p>
                <div className="text-xs text-gray-400 mt-1">
                  <p>Order ID: {order.id}</p>
                  <p>Paystack Ref: {order.paymentRef || "N/A"}</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-xl font-bold text-gray-800">₦{order.totalPrice?.toLocaleString()}</p>
                
                {order.status === "Pending" && (
                  <button 
                    onClick={() => markReady(order.id)}
                    className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
                  >
                    Mark Ready for Pickup
                  </button>
                )}

                {order.status === "Ready for Pickup" && (
                  <span className="text-xs text-green-600 font-medium">Waiting for Rider...</span>
                )}
              </div>

            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No active orders found.</p>
              <p className="text-xs text-gray-400 mt-2">
                Try clicking "Create Test Order" above to verify connection.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}