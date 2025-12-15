import React from 'react';

// MOCK DATA: In the future, this comes from Firebase 'vendors' collection
const VENDORS = [
  { id: 'v1', name: 'Rapid Print Gbagada', rating: 4.8, distance: '1.2km', price: 'Standard' },
  { id: 'v2', name: 'PrintHive Yaba', rating: 4.5, distance: '3.5km', price: 'Cheap' },
  { id: 'v3', name: 'Lagos Island Press', rating: 4.9, distance: '8.0km', price: 'Premium' },
];

export default function VendorList({ product, onSelectVendor, onBack }) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 mb-6">
        ← Back to Products
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Print Shop</h2>
      <p className="text-gray-600 mb-8">Who should print your <strong>{product.name}</strong>?</p>

      <div className="grid gap-4">
        {VENDORS.map((vendor) => (
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
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium">
                {vendor.price} Pricing
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}