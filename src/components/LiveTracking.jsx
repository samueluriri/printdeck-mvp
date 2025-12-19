import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, addDoc, collection } from 'firebase/firestore';

// Helper: Calculate distance between two GPS points (Haversine Formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export default function LiveTracking({ order, onBack }) {
  const [riderLocation, setRiderLocation] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(15); // Default ETA
  const [status, setStatus] = useState(order.status);
  
  // REVIEW SYSTEM STATES
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [vendorRating, setVendorRating] = useState(0);
  const [riderRating, setRiderRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // 1. GET CUSTOMER LOCATION (You)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Error getting location:", error)
      );
    }
  }, []);

  // 2. LISTEN TO RIDER LOCATION (Real-time from Database)
  useEffect(() => {
    // If no rider is assigned yet, just listen to order updates
    if (!order.riderId) return;

    // Listen to the RIDER'S user profile for GPS updates
    const riderRef = doc(db, "users", order.riderId);
    
    const unsubscribe = onSnapshot(riderRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currentLocation) {
          setRiderLocation(data.currentLocation);
        }
      }
    });

    return () => unsubscribe();
  }, [order.riderId]);

  // 3. LISTEN TO ORDER STATUS
  useEffect(() => {
    const orderRef = doc(db, "orders", order.id);
    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists()) {
        const newStatus = docSnap.data().status;
        setStatus(newStatus);
        
        // Trigger Review Modal when completed
        if (newStatus === 'Completed' && !reviewSubmitted) {
          setShowReviewModal(true);
        }
      }
    });
    return () => unsubscribe();
  }, [order.id, reviewSubmitted]);

  // 4. CALCULATE DISTANCE & PROGRESS
  useEffect(() => {
    if (myLocation && riderLocation) {
      const distKm = calculateDistance(
        myLocation.lat, myLocation.lng,
        riderLocation.lat, riderLocation.lng
      );
      setDistance(distKm.toFixed(1)); // e.g. "1.5" km
      
      // Estimate time: Assuming average speed of 20km/h in city
      // Time = Distance / Speed * 60 min
      const estTime = Math.ceil((distKm / 20) * 60); 
      setEta(estTime < 2 ? 1 : estTime); // Min 1 min
    }
  }, [myLocation, riderLocation]);

  // REVIEW SUBMISSION
  const submitReview = async () => {
    try {
      await addDoc(collection(db, "reviews"), {
        orderId: order.id,
        vendorId: order.vendorId,
        riderId: order.riderId,
        vendorRating,
        riderRating,
        comment: reviewComment,
        createdAt: new Date(),
        userId: order.userId
      });
      alert("Thanks for your feedback!");
      setReviewSubmitted(true);
      setShowReviewModal(false);
      onBack();
    } catch (e) {
      console.error("Error submitting review:", e);
      alert("Failed to submit review.");
    }
  };

  // Calculate visual progress bar based on status/distance
  const getProgress = () => {
    if (status === 'Completed') return 100;
    if (status === 'Ready for Pickup') return 10;
    if (status === 'Out for Delivery') {
      // If we have real distance, use it inversely (closer = higher %)
      // Simple logic: Start at 5km away (0%) -> 0km away (90%)
      if (distance) {
        const maxDist = 5; 
        const current = parseFloat(distance);
        const percent = Math.max(10, Math.min(90, ((maxDist - current) / maxDist) * 100));
        return percent;
      }
      return 50; // Fallback if no GPS
    }
    return 5;
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen flex flex-col relative shadow-2xl overflow-hidden md:rounded-3xl md:min-h-[800px] md:my-8 md:border md:border-gray-200 dark:md:border-gray-800">
      
      {/* 1. THE MAP LAYER */}
      <div className="flex-grow bg-gray-100 dark:bg-gray-800 relative overflow-hidden group">
        {/* Abstract Map Grid */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
        
        {/* Radar Effect for Rider */}
        {riderLocation && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
             <div className="w-64 h-64 border border-indigo-500/20 rounded-full animate-ping"></div>
           </div>
        )}

        {/* Status Center Text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <div className="text-6xl mb-2 animate-bounce">
            {status === 'Out for Delivery' ? '🛵' : status === 'Completed' ? '✅' : '👨‍🍳'}
          </div>
          {distance && status === 'Out for Delivery' && (
            <div className="bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
              <span className="font-bold text-indigo-600">{distance}km</span> away
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="absolute top-4 right-4">
          <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full ${riderLocation ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${riderLocation ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            {riderLocation ? 'GPS LIVE' : 'Waiting for GPS...'}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM SHEET */}
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] p-6 relative z-30">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6"></div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{status}</h2>
            <p className="text-gray-500 text-sm">Order ID: #{order.id.slice(0, 6)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Est. Arrival</p>
            <p className="text-xl font-bold text-indigo-600">{eta} mins</p>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>

        {/* Rider Info Card */}
        {order.riderId && (
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.riderId}`} alt="Rider" className="w-full h-full" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-gray-900 dark:text-white">Delivery Rider</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Verifying Identity...</p>
            </div>
            <a href={`tel:0800000000`} className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition">
              📞
            </a>
          </div>
        )}

        <button 
          onClick={onBack}
          className="w-full bg-gray-900 dark:bg-gray-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition transform active:scale-95"
        >
          Close Tracking
        </button>
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm mb-4 border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">Order Completed! 🎉</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Please rate your experience.</p>
            
            {/* Vendor Rating */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Rate Vendor ({order.vendorName})</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setVendorRating(star)}
                    className={`text-2xl transition hover:scale-125 ${star <= vendorRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Rider Rating */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Rate Delivery</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRiderRating(star)}
                    className={`text-2xl transition hover:scale-125 ${star <= riderRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <textarea 
              placeholder="Any additional comments?"
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm mb-4 outline-none border border-gray-200 dark:border-gray-700"
              rows="2"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />

            <button 
              onClick={submitReview}
              disabled={vendorRating === 0 || riderRating === 0}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}