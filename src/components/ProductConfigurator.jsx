import React, { useState } from 'react';
// FIX: Explicitly added .js extension to resolve path issues
import { db } from '../firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import { PaystackButton } from 'react-paystack';

export default function ProductConfigurator({ product, vendor, user, onBack }) {
  
  if (!product) return null;

  const [quantity, setQuantity] = useState(100);
  const [paperType, setPaperType] = useState("Standard Matte");
  const [isUploading, setIsUploading] = useState(false);
  
  const priceString = product.price || "0"; 
  const basePrice = parseInt(priceString.replace(/[^\d]/g, '')) || 0;
  const totalPrice = basePrice * (quantity / 100); 

  // CONFIGURATION
  // 👇👇👇 VERIFY THIS KEY IS CORRECT 👇👇👇
  const publicKey = 'pk_test_bd406b657e73316d11a5859b914a563982001fc6'; 
  
  const amount = Math.max(100, Math.ceil(totalPrice * 100)); // Kobo
  const userEmail = user?.email || "guest@example.com";
  const userId = user?.uid || "anonymous";

  const handleUpload = () => {
    if (isUploading) return; 
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("Design file attached successfully! (Simulation)");
    }, 2000);
  };

  // DATABASE SAVE FUNCTION
  const saveOrderToFirebase = async (paymentRef) => {
    try {
      console.log("Saving order to database...");
      const orderData = {
        userId: userId,
        userEmail: userEmail,
        productName: product.name,
        vendorName: vendor ? vendor.name : "Unknown Vendor", 
        vendorId: vendor ? vendor.id : "unknown",
        quantity: quantity,
        paperType: paperType,
        totalPrice: totalPrice,
        createdAt: new Date(), 
        status: "Pending",
        paymentRef: paymentRef 
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      console.log("Order saved successfully with ID: ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Firebase Write Error:", e);
      throw e;
    }
  }

  // PAYSTACK HANDLERS
  const handlePaystackSuccessAction = async (reference) => {
    console.log("Paystack Payment Success:", reference); 
    try {
      const orderId = await saveOrderToFirebase(reference.reference);
      alert(`Payment & Order Successful! ID: ${orderId}`);
      onBack(); 
    } catch (e) {
      alert(`Payment succeeded, but saving to database failed: ${e.message}`);
    }
  };

  const handlePaystackCloseAction = () => {
    console.log("Payment window closed");
    alert("Payment cancelled.");
  };

  // PROPS FOR THE BUTTON COMPONENT
  const componentProps = {
    email: userEmail,
    amount: amount,
    publicKey: publicKey,
    text: "Pay Now with Paystack",
    onSuccess: handlePaystackSuccessAction,
    onClose: handlePaystackCloseAction,
  };

  // DEBUG TOOL
  const handleDebugSave = async () => {
    try {
      await saveOrderToFirebase("DEBUG_NO_PAYMENT");
      alert("Debug Order Saved! Database connection is working.");
    } catch (e) {
      alert(`Debug Save Failed: ${e.message}`);
    }
  }

  // VALIDATION: Check if Key is present
  const isKeyMissing = !publicKey || publicKey.includes('YOUR_PUBLIC_KEY');

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 font-medium mr-4">← Back</button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configure {product.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Printing with: <span className="font-semibold text-indigo-600">{vendor ? vendor.name : 'Unknown Shop'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-lg p-10 flex items-center justify-center text-6xl">{product.icon}</div>

        <div className="space-y-6">
          {/* Form Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="10" step="10" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-indigo-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paper Finish</label>
            <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 bg-white">
              <option>Standard Matte</option>
              <option>Premium Glossy (+₦2,000)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Design</label>
            <div onClick={handleUpload} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer border-gray-300 hover:border-indigo-400">
              {isUploading ? <span className="text-indigo-600 font-bold">Uploading...</span> : <span className="text-gray-500">Click to upload</span>}
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center">
            <span className="text-indigo-900 font-medium">Total:</span>
            <span className="text-2xl font-bold text-indigo-700">₦{totalPrice.toLocaleString()}</span>
          </div>

          {/* PAYMENT BUTTON OR WARNING */}
          {isKeyMissing ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center font-bold">
              Error: Paystack Key Missing in Code!
            </div>
          ) : (
            <PaystackButton 
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
              {...componentProps} 
            />
          )}

          {/* DEBUG LINK */}
          <div className="text-center mt-2">
            <button onClick={handleDebugSave} className="text-xs text-gray-400 hover:text-red-500 underline">
              (Debug: Save without Payment)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}