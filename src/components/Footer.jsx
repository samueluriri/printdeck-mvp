import React from "react";
import { Printer } from "lucide-react";

const Footer = () => {
  return (
    <footer className="px-6 md:px-8 py-12 md:py-16 max-w-[1400px] mx-auto border-t border-zinc-100 bg-white font-sans-ui">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center rounded-lg">
              <Printer size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold text-zinc-900">PrintDeck</span>
          </div>
          <p className="font-sans-ui text-sm text-zinc-600 max-w-sm leading-relaxed">
            Fast, reliable, and affordable printing services delivered right to your doorstep.
          </p>
        </div>

        <div>
          <h3 className="font-sans-ui text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wide">Company</h3>
          <div className="space-y-3">
            {['About Us', 'Careers', 'Contact'].map(link => (
              <button key={link} className="block font-sans-ui text-sm text-zinc-600 hover:text-blue-600 transition-colors">
                {link}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-sans-ui text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wide">Legal</h3>
          <div className="space-y-3">
            {['Privacy', 'Terms', 'Security'].map(link => (
              <button key={link} className="block font-sans-ui text-sm text-zinc-600 hover:text-blue-600 transition-colors">
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-sans-ui text-sm text-zinc-500">
          © 2026 PrintDeck. All rights reserved.
        </p>
        <div className="flex gap-6">
          {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
            <button key={social} className="font-sans-ui text-sm text-zinc-500 hover:text-blue-600 transition-colors">
              {social}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;