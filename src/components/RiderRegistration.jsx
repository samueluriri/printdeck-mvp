import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function RiderRegistration({ user, onComplete, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    nin: '',
    vehicleType: 'Motorcycle',
    plateNumber: '',
    address: '',
    guarantorName: '',
    guarantorPhone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user profile with rider details and change role
      const userRef = doc(db, "users", user.uid);
      
      await updateDoc(userRef, {
        ...formData,
        role: 'rider', // Auto-promote for MVP. In a real app, use 'pending_rider' for admin approval
        riderStatus: 'active',
        onboardedAt: new Date()
      });

      alert("Registration Successful! Welcome to the Fleet.");
      onComplete(); // Navigate to Rider Dashboard
    } catch (error) {
      console.error("Error registering rider:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Become a PrintDeck Rider</h2>
          <p className="text-indigo-100 mt-1">Join our logistics fleet and earn money delivering prints.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required name="fullName" type="text" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input required name="phoneNumber" type="tel" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+234..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Residential Address</label>
                <input required name="address" type="text" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="123 Street Name, City" />
              </div>
            </div>
          </div>

          {/* Identification */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Identification</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIN / National ID Number</label>
              <input required name="nin" type="text" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="11-digit NIN" />
            </div>
          </div>

          {/* Vehicle Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Vehicle Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Type</label>
                <select name="vehicleType" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option>Motorcycle</option>
                  <option>Bicycle</option>
                  <option>Car/Van</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plate Number</label>
                <input required name="plateNumber" type="text" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ABC-123-DE" />
              </div>
            </div>
          </div>

          {/* Guarantor Info (World Class Requirement) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Guarantor / Next of Kin</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input required name="guarantorName" type="text" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input required name="guarantorPhone" type="tel" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg disabled:opacity-70">
              {loading ? "Registering..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}