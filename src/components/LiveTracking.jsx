import React, { useEffect, useState } from 'react';

export default function LiveTracking({ order, onBack }) {
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(15);

  // Simulate movement based on status
  useEffect(() => {
    let interval;
    if (order.status === 'Out for Delivery') {
      // Animate progress from 30% to 90%
      setProgress(30);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90; // Wait at 90% until delivered
          return prev + 1;
        });
        setEta((prev) => (prev > 2 ? prev - 1 : 2)); // Decrease ETA
      }, 1000); // Fast simulation
    } else if (order.status === 'Completed') {
      setProgress(100);
      setEta(0);
    } else if (order.status === 'Ready for Pickup') {
      setProgress(20);
    } else {
      setProgress(5);
    }

    return () => clearInterval(interval);
  }, [order.status]);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col relative shadow-2xl overflow-hidden md:rounded-3xl md:min-h-[800px] md:my-8 md:border md:border-gray-200">
      
      {/* 1. THE MAP (Simulated Visual Layer) */}
      <div className="flex-grow bg-gray-100 relative overflow-hidden group">
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
        
        {/* Roads (CSS Art) */}
        <div className="absolute top-1/2 left-0 w-full h-8 bg-gray-200 -translate-y-1/2 border-y-2 border-white"></div>
        <div className="absolute top-0 left-1/2 w-8 h-full bg-gray-200 -translate-x-1/2 border-x-2 border-white"></div>

        {/* Vendor Marker (Start) */}
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-xl border-2 border-indigo-100">
            🏪
          </div>
          <span className="text-xs font-bold text-gray-600 bg-white/80 px-2 rounded mt-1 shadow-sm">{order.vendorName || "Vendor"}</span>
        </div>

        {/* Customer Marker (End) */}
        <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white text-xl ring-4 ring-indigo-100 animate-pulse">
            🏠
          </div>
          <span className="text-xs font-bold text-gray-600 bg-white/80 px-2 rounded mt-1 shadow-sm">You</span>
        </div>

        {/* THE RIDER (Animated) */}
        <div 
          className="absolute z-20 transition-all duration-1000 ease-linear flex flex-col items-center"
          style={{ 
            // Simple logic to move diagonally from Top-Left (Vendor) to Bottom-Right (Customer)
            top: `${25 + (progress * 0.5)}%`, 
            left: `${25 + (progress * 0.5)}%` 
          }}
        >
          <div className="w-10 h-10 bg-yellow-400 rounded-full shadow-xl border-2 border-white flex items-center justify-center text-lg transform -scale-x-100">
            🛵
          </div>
          {order.status === 'Out for Delivery' && (
            <div className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full mt-1 font-bold whitespace-nowrap shadow-lg">
              {eta} mins
            </div>
          )}
        </div>
      </div>

      {/* 2. BOTTOM SHEET (Order Details) */}
      <div className="bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] p-6 relative z-30">
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{order.status}</h2>
            <p className="text-gray-500 text-sm">Order ID: #{order.id.slice(0, 6)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Est. Arrival</p>
            <p className="text-xl font-bold text-indigo-600">{eta} mins</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Rider Info Card */}
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.riderId || 'rider'}`} alt="Rider" className="w-full h-full" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-gray-900">Samuel (Rider)</h3>
            <p className="text-xs text-gray-500">4.9 ★ • Red Motorcycle</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition">
            📞
          </button>
        </div>

        {/* Order Items Summary */}
        <div className="border-t border-gray-100 pt-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">1x {order.productName}</span>
            <span className="font-medium">₦{order.totalPrice?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Payment Method</span>
            <span>Paystack (Paid)</span>
          </div>
        </div>

        {/* Actions */}
        <button 
          onClick={onBack}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition transform active:scale-95"
        >
          Close Tracking
        </button>
      </div>
    </div>
  );
}