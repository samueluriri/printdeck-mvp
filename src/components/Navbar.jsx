import React, { useState, useEffect } from "react";
import { Printer, Menu, X } from "lucide-react";

const Navbar = ({ activeCount, onLogout, onMyOrders, onHome, user, onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (item) => {
    // Placeholder for navigation
    console.log(`Navigating to ${item}`);
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? "py-4 glass-nav shadow-sm" : "py-6 bg-white/95"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center rounded-lg shadow-sm">
            <Printer size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-base md:text-lg font-bold tracking-tight text-zinc-900">
            PrintDeck
          </span>
        </div>

        <div className="hidden md:flex gap-8 lg:gap-10">
          {['Services', 'Pricing', 'About'].map(item => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className="text-sm font-sans-ui font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={onMyOrders}
                className="bg-zinc-900 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-sans-ui font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                My Orders
                {activeCount > 0 && (
                  <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[10px]">
                    {activeCount}
                  </span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="hidden lg:block text-sm font-sans-ui font-medium text-zinc-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="bg-zinc-900 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-sans-ui font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-sm hover:shadow-md hidden sm:block"
            >
              Sign In
            </button>
          )}

          <button className="md:hidden text-zinc-900" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-zinc-100 p-6 flex flex-col gap-6 shadow-xl animate-fade-in-up">
          {['Services', 'Pricing', 'About'].map(item => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className="text-left text-sm font-sans-ui font-medium text-zinc-600 hover:text-zinc-900"
            >
              {item}
            </button>
          ))}
          <div className="h-px bg-zinc-100 w-full my-2" />
          {user ? (
            <button onClick={() => { onLogout(); setMenuOpen(false); }} className="text-left text-sm font-sans-ui font-medium text-red-600">Logout</button>
          ) : (
            <button onClick={() => { onLogin(); setMenuOpen(false); }} className="text-left text-sm font-sans-ui font-bold text-zinc-900">Sign In</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;