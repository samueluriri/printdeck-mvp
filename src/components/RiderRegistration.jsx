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
  
  // VERIFICATION STATES
  const [verifyingNIN, setVerifyingNIN] = useState(false);
  const [ninVerified, setNinVerified] = useState(false);
  
  const [verifyingPlate, setVerifyingPlate] = useState(false);
  const [plateVerified, setPlateVerified] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. SIMULATED NIN LOOKUP (Identitypass/Dojah Simulation)
  const handleVerifyNIN = () => {
    if (formData.nin.length < 11) {
      alert("Please enter a valid 11-digit NIN");
      return;
    }
    setVerifyingNIN(true);

    // Simulate API Call to NIMC Database
    setTimeout(() => {
      setVerifyingNIN(false);
      setNinVerified(true);
      
      // Auto-fill name from "Database"
      const mockNameFromNIMC = "Samuel Oladipo"; // In real app, this comes from API
      setFormData(prev => ({ ...prev, fullName: mockNameFromNIMC }));
      
      alert(`NIN Verified! Identity Confirmed: ${mockNameFromNIMC}`);
    }, 2000);
  };

  // 2. SIMULATED FRSC PLATE LOOKUP
  const handleVerifyPlate = () => {
    if (formData.plateNumber.length < 5) {
      alert("Please enter a valid Plate Number");
      return;
    }
    setVerifyingPlate(true);

    // Simulate API Call to FRSC Database
    setTimeout(() => {
      setVerifyingPlate(false);
      setPlateVerified(true);
      setVehicleDetails("Toyota Corolla (Red) - 2015 Model");
      alert("Vehicle Verified against FRSC Database.");
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if verification is needed (skip plate check for bicycles)
    const needsPlateCheck = formData.vehicleType !== 'Bicycle';

    if (!ninVerified || (needsPlateCheck && !plateVerified)) {
      alert(`Please verify your NIN${needsPlateCheck ? ' and Plate Number' : ''} before submitting.`);
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", user.uid);
      
      await updateDoc(userRef, {
        ...formData,
        role: 'rider', 
        riderStatus: 'active',
        kycStatus: 'verified', // Mark as KYC Verified
        onboardedAt: new Date()
      });

      alert("Registration Successful! Welcome to the Fleet.");
      onComplete(); 
    } catch (error) {
      console.error("Error registering rider:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="bg-indigo-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🛡️</span> Rider KYC Onboarding
          </h2>
          <p className="text-indigo-100 mt-1">Identity verification is required to join the fleet.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* SECTION 1: Identity Verification (NIN) */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              1. National Identification
              {ninVerified && <span className="text-green-500 text-sm">✓ Verified</span>}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* NIN Input with Action Button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIN Number</label>
                <div className="flex gap-2">
                  <input 
                    required 
                    name="nin" 
                    type="text" 
                    onChange={handleChange} 
                    className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="11-digit NIN"
                    disabled={ninVerified} // Lock after verification
                  />
                  <button 
                    type="button"
                    onClick={handleVerifyNIN}
                    disabled={ninVerified || verifyingNIN}
                    className={`px-4 py-2 rounded-lg font-bold text-white transition ${ninVerified ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    {verifyingNIN ? "Checking..." : ninVerified ? "Done" : "Verify"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">We verify this against the NIMC database.</p>
              </div>

              {/* Full Name (Auto-filled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name (Auto-filled)</label>
                <input 
                  required 
                  name="fullName" 
                  type="text" 
                  value={formData.fullName}
                  readOnly // User cannot edit this, it comes from NIN
                  className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" 
                  placeholder="Verify NIN to fetch name..." 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">2. Contact Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input required name="phoneNumber" type="tel" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+234..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Residential Address</label>
                <input required name="address" type="text" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="123 Street Name, City" />
              </div>
            </div>
          </div>

          {/* SECTION 3: Vehicle Verification (FRSC) */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              3. Vehicle Verification
              {plateVerified && <span className="text-green-500 text-sm">✓ Verified</span>}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Type</label>
                <select name="vehicleType" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option>Motorcycle</option>
                  <option>Bicycle</option>
                  <option>Car/Van</option>
                </select>
              </div>

              {/* Plate Number Verify - Only show if NOT Bicycle */}
              {formData.vehicleType !== 'Bicycle' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plate Number</label>
                  <div className="flex gap-2">
                    <input 
                      required 
                      name="plateNumber" 
                      type="text" 
                      onChange={handleChange} 
                      className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                      placeholder="ABC-123-DE"
                      disabled={plateVerified}
                    />
                    <button 
                      type="button"
                      onClick={handleVerifyPlate}
                      disabled={plateVerified || verifyingPlate}
                      className={`px-4 py-2 rounded-lg font-bold text-white transition ${plateVerified ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {verifyingPlate ? "..." : plateVerified ? "✓" : "Check"}
                    </button>
                  </div>
                  {plateVerified && (
                    <p className="text-xs text-green-600 font-bold mt-1">Found: {vehicleDetails}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Guarantor */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">4. Guarantor / Next of Kin</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guarantor Name</label>
                <input required name="guarantorName" type="text" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guarantor Phone</label>
                <input required name="guarantorPhone" type="tel" onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition">
              Cancel
            </button>
            <button 
              type="submit" 
              // Disable logic: NIN verified AND (Is Bicycle OR Plate Verified)
              disabled={loading || !ninVerified || (formData.vehicleType !== 'Bicycle' && !plateVerified)} 
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}