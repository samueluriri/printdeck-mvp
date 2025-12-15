import React from 'react';

// DATA: The list of items we sell
const products = [
  {
    id: 1,
    name: "A4 Document Printing", 
    price: "₦50 / page",
    description: "Perfect for assignments, projects & thesis. BW or Color.",
    icon: "📑"
  },
  {
    id: 2,
    name: "Business Cards",
    price: "₦5,000",
    description: "Premium matte finish, double-sided, 100pcs.",
    icon: "📇"
  },
  {
    id: 3,
    name: "A5 Flyers",
    price: "₦15,000",
    description: "Glossy paper, vibrant colors, marketing flyers.",
    icon: "📄"
  },
  {
    id: 4,
    name: "Roll-up Banners",
    price: "₦25,000",
    description: "Standard size, includes stand and carrier bag.",
    icon: "🎏"
  }
];

// NOTICE: We are now receiving 'onSelectProduct' as a tool (prop) from App.jsx
export default function ProductGrid({ onSelectProduct }) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Popular Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {products.map((product) => (
            <div 
              key={product.id} 
              // CRITICAL: This 'onClick' triggers the function passed from App.jsx
              // It says: "Hey App, the user just selected THIS product."
              onClick={() => onSelectProduct(product)}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
            >
              
              <div className="text-4xl mb-4">{product.icon}</div>
              
              <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
              
              <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-indigo-600 font-bold text-lg">{product.price}</span>
                <button className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-semibold hover:bg-indigo-100 transition">
                  Select
                </button>
              </div>
            
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}