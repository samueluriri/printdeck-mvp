import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function Login({ onBack }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      let msg = err.message;
      if (msg.includes("auth/invalid-email")) msg = "Invalid email address.";
      if (msg.includes("auth/user-not-found")) msg = "User not found.";
      if (msg.includes("auth/wrong-password")) msg = "Incorrect password.";
      if (msg.includes("auth/email-already-in-use")) msg = "Email already in use.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-zinc-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-zinc-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 border border-zinc-100 animate-fade-in-up md:p-12 relative overflow-hidden">
        {/* subtle grid bg */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>

        {onBack && (
          <button onClick={onBack} className="text-xs font-mono-tech font-bold text-zinc-400 hover:text-zinc-900 mb-8 flex items-center gap-2 transition uppercase tracking-widest relative z-10">
            <ArrowLeft size={14} /> Go Back
          </button>
        )}

        <div className="text-center mb-10 relative z-10">
          <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl mx-auto mb-6 shadow-xl shadow-zinc-200">
            P
          </div>
          <h2 className="text-3xl font-display font-bold text-zinc-900 mb-3 tracking-tight">
            {isSignUp ? "Initialize Identity" : "Welcome Back"}
          </h2>
          <p className="text-zinc-500 font-mono-tech text-xs uppercase tracking-widest">
            {isSignUp ? "Join the network to print." : "Authenticate to access terminal."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-2 border border-red-100 relative z-10">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1 font-mono-tech tracking-widest">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 font-medium text-zinc-900"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 ml-1 font-mono-tech tracking-widest">Password</label>
            <input
              type="password"
              required
              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 font-medium text-zinc-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-mono-tech text-xs uppercase tracking-widest
              ${loading ? 'bg-zinc-700 cursor-wait' : 'bg-zinc-900 hover:bg-black shadow-zinc-200'}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Processing...
              </span>
            ) : (isSignUp ? "Create Account" : "Access Terminal")}
          </button>
        </form>

        <div className="mt-10 text-center text-xs text-zinc-500 font-medium relative z-10">
          {isSignUp ? "Already part of the network?" : "New to PrintDeck?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-zinc-900 font-bold hover:underline focus:outline-none"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}