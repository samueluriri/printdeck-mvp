import React from "react";

const Footer = () => {
  return (
    <footer className="py-24 border-t border-zinc-100 bg-white text-zinc-900 font-sans">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-zinc-900 rounded-md" />
              <span className="font-display font-bold uppercase tracking-widest">
                PrintDeck
              </span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-sans-ui">
              Physical asset delivery via decentralized fabrication nodes. Building
              the last-mile manufacturing layer.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            {[
              { title: "Platform", links: ["Services", "Nodes", "Docs"] },
              { title: "Company", links: ["About", "Privacy", "Legal"] },
              { title: "Social", links: ["X.com", "GitHub", "Discord"] },
            ].map((cat) => (
              <div key={cat.title} className="space-y-6">
                <h5 className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-zinc-900">
                  {cat.title}
                </h5>
                <ul className="space-y-4">
                  {cat.links.map((link) => (
                    <li
                      key={link}
                      className="text-zinc-400 text-sm hover:text-zinc-900 cursor-pointer transition-colors font-sans-ui"
                    >
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-50 flex flex-col sm:flex-row justify-between items-center gap-6 font-mono-tech text-[9px] uppercase tracking-[0.4em] text-zinc-300">
          <span>© 2026 PRINTDECK GLOBAL PROTOCOL</span>
          <div className="flex gap-8">
            <span>LATENCY: 14MS</span>
            <span>STATUS: NOMINAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;