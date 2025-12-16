import React, { useEffect, useState } from 'react';
// 1. IMPORT Database tools
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function VendorList({ product, onSelectVendor, onBack }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. FETCH VENDORS from Firebase
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vendors"));
        const vendorList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVendors(vendorList);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching vendors:", e);
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // 3. HELPER: Add Fake Vendors (Run this once)
  const seedVendors = async () => {
    const mockVendors = [
      { name: 'Rapid Print Gbagada', rating: 4.8, distance: '1.2km', price: 'Standard' },
      { name: 'PrintHive Yaba', rating: 4.5, distance: '3.5km', price: 'Cheap' },
      { name: 'Lagos Island Press', rating: 4.9, distance: '8.0km', price: 'Premium' },
    ];

    alert("Adding vendors to database... please wait.");
    
    for (const v of mockVendors) {
      await addDoc(collection(db, "vendors"), v);
    }
    
    alert("Vendors Added! Refresh the page.");
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 mb-6">
        ← Back to Products
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Print Shop</h2>
          <p className="text-gray-600">Who should print your <strong>{product.name}</strong>?</p>
        </div>
        
        {/* Helper Button: Only shows if list is empty */}
        {vendors.length === 0 && !loading && (
          <button 
            onClick={seedVendors}
            className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
          >
            + Add Test Vendors
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading print shops near you...</p>
      ) : vendors.length === 0 ? (
        <p className="text-gray-500">No print shops found. Click the button above to add some.</p>
      ) : (
        <div className="grid gap-4">
          {vendors.map((vendor) => (
            <div 
              key={vendor.id}
              onClick={() => onSelectVendor(vendor)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-indigo-500 hover:shadow-md transition flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg text-gray-900">{vendor.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="text-yellow-600 font-bold">★ {vendor.rating}</span>
                  <span>•</span>
                  <span>{vendor.distance} away</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  vendor.price === 'Cheap' ? 'bg-green-100 text-green-800' : 
                  vendor.price === 'Premium' ? 'bg-purple-100 text-purple-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {vendor.price} Pricing
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}