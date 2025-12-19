import React, { useState } from 'react';
// FIX: Using standard import convention for Vite
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { PaystackButton } from 'react-paystack';

export default function ProductConfigurator({ product, vendor, user, onBack }) {
  
  if (!product) return null;

  const [quantity, setQuantity] = useState(100);
  const [paperType, setPaperType] = useState("Standard Matte");
  const [isUploading, setIsUploading] = useState(false);
  
  // 1. PRODUCT PRICE CALCULATION
  const priceString = product.price || "0"; 
  const basePrice = parseInt(priceString.replace(/[^\d]/g, '')) || 0;
  const productTotal = basePrice * (quantity / 100); 

  // 2. DYNAMIC DELIVERY FEE CALCULATION
  // Formula: Base ₦400 + (₦150 per KM)
  const calculateDeliveryFee = () => {
    if (!vendor || !vendor.distance) return 500; // Fallback
    // Convert "3.5km" string to number 3.5
    const distanceValue = parseFloat(vendor.distance.replace('km', '').trim());
    const baseFare = 400;
    const perKm = 150;
    
    const fee = baseFare + (distanceValue * perKm);
    return Math.ceil(fee / 50) * 50; // Round up to nearest 50 Naira
  };

  const deliveryFee = calculateDeliveryFee();
  const grandTotal = productTotal + deliveryFee;

  // PAYSTACK CONFIG
  // I have added the key you provided so it works immediately
  const publicKey = 'pk_test_bd406b657e73316d11a5859b914a563982001fc6'; 
  
  const amount = Math.max(100, Math.ceil(grandTotal * 100)); // Total in Kobo
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
        vendorDistance: vendor ? vendor.distance : "0km",
        
        quantity: quantity,
        paperType: paperType,
        
        // SAVE FINANCIAL BREAKDOWN
        productPrice: productTotal,
        deliveryFee: deliveryFee,
        totalPrice: grandTotal,
        
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
    text: `Pay ₦${grandTotal.toLocaleString()}`,
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
    <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 font-medium mr-4">← Back</button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configure {product.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Printing with: <span className="font-semibold text-indigo-600">{vendor ? vendor.name : 'Unknown Shop'}</span>
            <span className="mx-2">•</span>
            <span>{vendor ? vendor.distance : '0km'} away</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-10 flex items-center justify-center text-6xl">{product.icon}</div>

        <div className="space-y-6">
          {/* Form Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="10" step="10" className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-indigo-500 bg-white dark:bg-gray-800 dark:text-white"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Paper Finish</label>
            <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-indigo-500 bg-white dark:bg-gray-800 dark:text-white">
              <option>Standard Matte</option>
              <option>Premium Glossy (+₦2,000)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Design</label>
            <div onClick={handleUpload} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer border-gray-300 dark:border-gray-700 hover:border-indigo-400">
              {isUploading ? <span className="text-indigo-600 font-bold">Uploading...</span> : <span className="text-gray-500">Click to upload</span>}
            </div>
          </div>

          {/* PRICING BREAKDOWN */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal ({quantity} units)</span>
              <span>₦{productTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Delivery Fee ({vendor ? vendor.distance : 'Flat'})</span>
              <span>₦{deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-indigo-900 dark:text-indigo-300 font-bold">Total to Pay</span>
              <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">₦{grandTotal.toLocaleString()}</span>
            </div>
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