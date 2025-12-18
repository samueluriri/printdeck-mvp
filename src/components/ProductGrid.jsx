import React from 'react';

const products = [
  {
    id: 1,
    name: "A4 Documents", 
    price: "₦50",
    unit: "/ page",
    description: "Assignments, Thesis & Reports.",
    icon: "📄",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    id: 2,
    name: "Business Cards",
    price: "₦5,000",
    unit: "/ 100pcs",
    description: "Matte or Glossy finish.",
    icon: "📇",
    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
  },
  {
    id: 3,
    name: "A5 Flyers",
    price: "₦15,000",
    unit: "/ 100pcs",
    description: "Vibrant marketing materials.",
    icon: "📢",
    color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
  },
  {
    id: 4,
    name: "Roll-up Banners",
    price: "₦25,000",
    unit: "/ unit",
    description: "Events & Exhibitions.",
    icon: "🎏",
    color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300"
  }
];

export default function ProductGrid({ onSelectProduct }) {
  return (
    // UPGRADE: Changed background to match new dark theme
    <section className="py-16 bg-gray-50/50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
            Popular Categories
          </h2>
          {/* Fixed visibility issue: Text is now gray-400 in dark mode for better contrast against gray-950 */}
          <p className="mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400 mx-auto">
            Choose a product to get started. Instant pricing, fast delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {products.map((product) => (
            <div 
              key={product.id} 
              onClick={() => onSelectProduct(product)}
              // UPGRADE: Dark mode card styling
              // bg-white -> dark:bg-gray-900
              // border-gray-100 -> dark:border-gray-800
              className="group relative bg-white dark:bg-gray-900 rounded-3xl p-6 cursor-pointer border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out"
            >
              {/* Icon Bubble */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${product.color} group-hover:scale-110 transition-transform duration-300`}>
                {product.icon}
              </div>
              
              {/* Content */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4 font-medium">
                  {product.description}
                </p>
              </div>
              
              {/* Price Tag */}
              <div className="flex items-baseline gap-1 pt-4 border-t border-gray-50 dark:border-gray-800">
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">{product.price}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{product.unit}</span>
              </div>

              {/* Hover Action Indicator */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900">
                  →
                </div>
              </div>
            
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}