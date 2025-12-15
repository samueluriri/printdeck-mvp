import React, { useEffect, useState } from 'react';
// FIX: Added '.js' extension to explicitly resolve the file path
import { db } from '../firebase.js'; 
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function RiderDashboard({ onBack }) {
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myActiveJobs, setMyActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. LISTEN for Available Jobs (Status: "Ready for Pickup")
    // These are orders the Vendor has finished printing
    const qAvailable = query(
      collection(db, "orders"),
      where("status", "==", "Ready for Pickup"),
      orderBy("createdAt", "desc")
    );

    // 2. LISTEN for My Active Jobs (Status: "Out for Delivery")
    // These are orders this rider has already accepted
    const qActive = query(
      collection(db, "orders"),
      where("status", "==", "Out for Delivery"),
      orderBy("createdAt", "desc")
    );

    const unsubAvailable = onSnapshot(qAvailable, (snapshot) => {
      setAvailableJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubActive = onSnapshot(qActive, (snapshot) => {
      setMyActiveJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubAvailable();
      unsubActive();
    };
  }, []);

  // FUNCTION: Accept a Job
  const acceptJob = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Out for Delivery",
        riderId: "rider_123" // In a real app, this would be the logged-in rider's ID
      });
      alert("Job Accepted! Head to the vendor.");
    } catch (e) {
      console.error("Error accepting job:", e);
    }
  };

  // FUNCTION: Complete Delivery
  const completeJob = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Completed",
        deliveredAt: new Date()
      });
      alert("Delivery Confirmed! Great work.");
    } catch (e) {
      console.error("Error completing job:", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Rider App 🛵</h2>
        <button onClick={onBack} className="text-gray-600 font-medium hover:text-red-600">
          Exit App
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* COLUMN 1: AVAILABLE JOBS */}
        <div>
          <h3 className="font-bold text-lg text-gray-700 mb-4 flex items-center">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
              {availableJobs.length}
            </span>
            Ready for Pickup
          </h3>
          
          <div className="space-y-4">
            {availableJobs.map(job => (
              <div key={job.id} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500">
                <h4 className="font-bold text-gray-900">{job.vendorName}</h4>
                <p className="text-sm text-gray-500 mb-2">→ Delivering to Customer</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">Earn: ₦800</span>
                  <button 
                    onClick={() => acceptJob(job.id)}
                    className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded shadow hover:bg-green-700"
                  >
                    Accept Job
                  </button>
                </div>
              </div>
            ))}
            {availableJobs.length === 0 && <p className="text-gray-400 text-sm">No jobs available right now.</p>}
          </div>
        </div>

        {/* COLUMN 2: MY ACTIVE JOBS */}
        <div>
          <h3 className="font-bold text-lg text-gray-700 mb-4 flex items-center">
             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
              {myActiveJobs.length}
            </span>
            My Active Deliveries
          </h3>
          
          <div className="space-y-4">
            {myActiveJobs.map(job => (
              <div key={job.id} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Out for Delivery</span>
                  <span className="text-xs text-gray-400"># {job.id.slice(0,6)}</span>
                </div>
                <h4 className="font-bold text-gray-900 mt-2">{job.productName} ({job.quantity})</h4>
                <p className="text-sm text-gray-600">From: {job.vendorName}</p>
                
                <button 
                  onClick={() => completeJob(job.id)}
                  className="w-full mt-4 bg-gray-900 text-white text-sm font-bold px-4 py-3 rounded shadow hover:bg-gray-800 flex justify-center items-center"
                >
                  Confirm Delivery 📦
                </button>
              </div>
            ))}
            {myActiveJobs.length === 0 && <p className="text-gray-400 text-sm">You have no active deliveries.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}