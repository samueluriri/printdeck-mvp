import React from 'react';

// UPDATE: Accept 'activeCount' prop from App.jsx
export default function Navbar({ user, onLogout, onMyOrders, onHome, activeCount }) {
  return (
    <nav className="bg-white shadow-md w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer" 
            onClick={onHome}
          >
            <h1 className="text-2xl font-extrabold text-indigo-700 tracking-tighter">
              PrintDeck
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            
            <button 
              onClick={onHome} 
              className="text-gray-700 hover:text-indigo-600 font-medium bg-transparent border-none cursor-pointer"
            >
              Home
            </button>
            
            {/* My Orders Link with Notification Badge */}
            <button 
              onClick={onMyOrders} 
              className="text-gray-700 hover:text-indigo-600 font-medium bg-transparent border-none cursor-pointer relative"
            >
              My Orders
              
              {/* THE RED BADGE: Only show if count > 0 */}
              {activeCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center shadow-sm animate-bounce">
                  {activeCount}
                </span>
              )}
            </button>
            
            {/* User Info / Logout */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 hidden lg:block">Hello, {user.email}</span>
                <button 
                  onClick={onLogout}
                  className="text-gray-600 font-medium hover:text-red-600 border border-gray-300 px-4 py-2 rounded-lg hover:border-red-400 transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                Get Started
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}