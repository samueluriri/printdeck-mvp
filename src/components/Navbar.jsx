import React, { useState, useEffect } from "react";
import { Printer, Menu, X } from "lucide-react";

const Navbar = ({ activeCount, onLogout, onMyOrders, onHome, user, onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? "py-4 glass-nav shadow-sm" : "py-6 bg-transparent"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-8 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onHome}>
          <div className="w-8 h-8 bg-zinc-900 flex items-center justify-center rounded-lg shadow-lg group">
            <Printer
              size={16}
              className="text-white group-hover:scale-110 transition-transform"
            />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-zinc-900">
            PrintDeck<span className="text-zinc-400">.io</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {["Services", "Infrastructure", "Nodes", "Docs"].map((item) => (
            <a
              key={item}
              className="text-[10px] font-mono-tech uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer font-medium"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={onMyOrders}
                className="hidden md:flex items-center gap-2 text-[10px] font-mono-tech uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                My Orders
                {activeCount > 0 && (
                  <span className="bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[9px]">
                    {activeCount}
                  </span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="text-[10px] font-mono-tech uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors hidden md:block"
              >
                Logout
              </button>
            </>
          ) : (
            // No login button shown if not logged in, just the "Launch Terminal" button below handles it?
            // Actually, "Launch Terminal" in the snippet triggers the modal.
            // We'll treat "Launch Terminal" as the primary CTA coming up next.
            null
          )}

          <button
            onClick={user ? onHome : onLogin} // If logged in, maybe go to dashboard? Or if not, show login/start
            className="bg-zinc-900 text-white px-6 py-2.5 rounded-full text-[10px] font-mono-tech uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md hidden sm:block"
          >
            {user ? "Dashboard" : "Launch Terminal"}
          </button>

          <button className="lg:hidden text-zinc-900" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-zinc-100 p-8 flex flex-col gap-6 shadow-xl animate-fade-in-up">
          {["Services", "Infrastructure", "Nodes", "Docs"].map((item) => (
            <a
              key={item}
              className="text-xs font-mono-tech uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-900"
            >
              {item}
            </a>
          ))}
          <div className="h-px bg-zinc-100 w-full my-2" />
          {user ? (
            <>
              <button onClick={() => { onMyOrders(); setMenuOpen(false); }} className="text-left text-xs font-mono-tech uppercase tracking-widest text-zinc-900">My Orders</button>
              <button onClick={() => { onLogout(); setMenuOpen(false); }} className="text-left text-xs font-mono-tech uppercase tracking-widest text-red-500">Logout</button>
            </>
          ) : (
            <button onClick={() => { onLogin(); setMenuOpen(false); }} className="text-left text-xs font-mono-tech uppercase tracking-widest text-zinc-900">Launch Terminal</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;