import React from 'react';

export default function Hero({ onStart }) {
  return (
    <section className="relative bg-indigo-900 text-white overflow-hidden rounded-3xl mx-0 md:mx-4 my-6 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Text Content */}
        <div className="space-y-6 z-10 relative">
          <div className="inline-block bg-indigo-800 text-indigo-200 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-indigo-700">
            🚀 Now live in Lagos & Abuja
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
            Print anything, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Delivered fast.
            </span>
          </h1>
          
          <p className="text-lg text-indigo-100 max-w-lg leading-relaxed">
            Connect with top-rated local print shops. Upload your design, choose your paper, and get it delivered to your doorstep in hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onStart}
              className="bg-yellow-500 text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-yellow-400 hover:scale-105 transition transform"
            >
              Start Printing
            </button>
            <button className="px-8 py-4 rounded-xl font-bold text-white border border-indigo-700 hover:bg-indigo-800 transition">
              How it works
            </button>
          </div>
          
          <div className="pt-4 flex flex-wrap items-center gap-4 text-sm text-indigo-300 font-medium">
            <span className="flex items-center gap-1">✅ Instant Quotes</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">✅ Verified Vendors</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">✅ Fast Delivery</span>
          </div>
        </div>

        {/* Right Column: Abstract Visuals */}
        <div className="relative lg:h-full min-h-[300px] hidden md:flex items-center justify-center">
           {/* Glowing blobs for background effect */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
           
           {/* Floating Card 1 */}
           <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
              <div className="text-5xl mb-4">🖨️</div>
              <h3 className="text-xl font-bold text-white mb-1">Quality Prints</h3>
              <p className="text-indigo-200 text-sm">Professional finish every time.</p>
           </div>
           
           {/* Floating Card 2 */}
           <div className="absolute -bottom-6 -right-4 bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-2xl transform -rotate-3 hover:rotate-0 transition duration-500 z-0">
              <div className="text-4xl mb-2">🛵</div>
              <h3 className="text-lg font-bold text-white">Fast Delivery</h3>
           </div>
        </div>

      </div>
    </section>
  );
}