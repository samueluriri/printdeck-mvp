import React from 'react';

export default function Navbar({ user, onLogout, onMyOrders, onHome, activeCount }) {
  return (
    // UPGRADE: Added dark mode specific classes for a premium feel
    // bg-white/80 -> dark:bg-gray-950/80 (Deep black glass)
    // border-gray-100 -> dark:border-gray-800 (Subtle dark border)
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer gap-2 group" 
            onClick={onHome}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-indigo-200 dark:shadow-none shadow-lg group-hover:rotate-12 transition-transform">
              P
            </div>
            {/* Dark text -> White text */}
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              PrintDeck
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            
            <button 
              onClick={onHome} 
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Home
            </button>
            
            <button 
              onClick={onMyOrders} 
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative"
            >
              My Orders
              
              {activeCount > 0 && (
                <span className="absolute -top-3 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
                  {activeCount}
                </span>
              )}
            </button>
            
            {/* User Info / Logout */}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-800">
                <div className="hidden lg:flex flex-col items-end">
                  {/* Fixed clarity issues: using lighter grays for dark mode */}
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Logged in as</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{user.email.split('@')[0]}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full transition-all"
                  title="Log Out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            ) : (
              <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all">
                Get Started
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}