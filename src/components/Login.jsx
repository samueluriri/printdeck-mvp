import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page refresh
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Create new account
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Log in existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Note: We don't need to manually redirect here. 
      // App.jsx will detect the login automatically via onAuthStateChanged.
    } catch (err) {
      // Clean up error messages for users
      let msg = err.message;
      if (msg.includes("auth/invalid-email")) msg = "Invalid email address.";
      if (msg.includes("auth/user-not-found")) msg = "User not found.";
      if (msg.includes("auth/wrong-password")) msg = "Incorrect password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          {isSignUp ? "Join PrintDeck today" : "Log in to continue printing"}
        </p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 rounded-lg font-bold transition shadow-md
              ${loading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-indigo-600 font-semibold hover:underline focus:outline-none"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}