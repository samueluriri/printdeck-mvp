import React from "react";

const ProductCard = ({ title, icon, color, delay, onClick }) => (
  <div
    onClick={onClick}
    className={`group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-indigo-100 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden ${delay}`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-bl-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700 ease-out`}></div>

    <div className="relative z-10">
      <div className={`w-14 h-14 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center text-3xl mb-6 group-hover:bg-${color}-600 group-hover:text-white transition-colors duration-300 shadow-sm`}>
        {icon}
      </div>

      <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-indigo-900">{title}</h3>
      <p className="text-sm text-slate-500 group-hover:text-slate-600">Perfect for all your needs. High quality finish.</p>

      <div className="mt-6 flex items-center text-indigo-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        Order Now <span className="ml-1">→</span>
      </div>
    </div>
  </div>
);

const ProductGrid = ({ onSelectProduct }) => {
  const products = [
    { name: "A4 Document", icon: "📄", color: "blue", delay: "" },
    { name: "Banner", icon: "🚩", color: "purple", delay: "md:mt-8" }, // Staggered layout
    { name: "Stickers", icon: "✨", color: "pink", delay: "" },
    { name: "Business Cards", icon: "💳", color: "orange", delay: "md:mt-8" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-20 px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Popular Products</h2>
        <p className="text-slate-500 max-w-lg mx-auto">Choose from our wide range of high-quality printing options tailored to your needs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p, i) => (
          <ProductCard
            key={i}
            title={p.name}
            icon={p.icon}
            color={p.color}
            delay={p.delay}
            onClick={() => onSelectProduct({ name: p.name })}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;