import React from 'react';

// 'export default' allows other files (like App.jsx) to import and use this component.
export default function Footer() {
  
  // We return JSX (HTML-like code) that React renders to the screen.
  return (
    // <footer> tag: Semantic HTML to tell Google/Browsers this is the bottom of the page.
    // bg-gray-900: Dark background color.
    // text-white: White text color.
    // py-12: Padding on the Y-axis (top and bottom) of 3rem (48px).
    <footer className="bg-gray-900 text-white py-12">
      
      {/* Container to center content and add side margins */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Brand Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">PrintDeck</h3>
          <p className="text-gray-400 text-sm">
            Nigeria's #1 decentralized printing marketplace. 
            From your phone to the print shop in minutes.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-bold mb-4 text-indigo-400">Company</h4>
          {/* Flex-col stacks the links vertically */}
          <div className="flex flex-col space-y-2 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition">About Us</a>
            <a href="#" className="hover:text-white transition">Become a Vendor</a>
            <a href="#" className="hover:text-white transition">Rider Partner</a>
          </div>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h4 className="font-bold mb-4 text-indigo-400">Support</h4>
          <div className="text-sm text-gray-400 space-y-2">
            <p>Lagos, Nigeria</p>
            <p>support@printdeck.ng</p>
            <p>+234 800 PRINT DECK</p>
          </div>
        </div>

      </div>

      {/* Copyright Section (Border top line) */}
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        © 2025 PrintDeck Technologies. All rights reserved.
      </div>
    </footer>
  );
}