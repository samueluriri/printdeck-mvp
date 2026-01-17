import { ArrowRight, FileText, Flag, Star, CreditCard, Layers, Activity, Globe, Printer } from 'lucide-react';

export default function LandingPage({ onStart }) {
    const handleProductClick = (product) => {
        // Ideally this would navigate or pass selection up
        // For now we just use the onStart to go to upload/login
        onStart();
    };

    return (
        <div className="animate-fade-in-up">
            {/* --- HERO SECTION --- */}
            <div className="pt-10 md:pt-12">
                <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-[2rem] md:rounded-[3rem] mx-4 md:mx-8 mb-16 md:mb-20 py-20 md:py-32 px-6 md:px-16 text-center text-white relative overflow-hidden shadow-xl">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 md:mb-8">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="font-sans-ui text-xs md:text-sm font-medium text-white/90">Fast, Reliable, Local Printing</span>
                        </div>

                        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-5 md:mb-6 tracking-tight leading-tight">
                            Print Anything,<br className="hidden sm:block" /> Delivered Fast.
                        </h1>
                        <p className="font-sans-ui text-base md:text-lg lg:text-xl mb-10 md:mb-12 text-blue-50 max-w-2xl mx-auto leading-relaxed">
                            Upload documents from your room and get them delivered in minutes. Professional quality, affordable prices.
                        </p>
                        <button
                            onClick={onStart}
                            className="bg-white text-blue-600 px-8 md:px-12 py-4 md:py-5 rounded-full font-sans-ui text-sm md:text-base font-bold hover:scale-105 transition-transform active:scale-95 shadow-2xl hover:shadow-3xl inline-flex items-center gap-3 group"
                        >
                            Start Printing
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 md:px-8 pb-20 md:pb-32">
                    {/* --- PRODUCT CARDS --- */}
                    <div className="mb-24 md:mb-32">
                        <div className="text-center mb-10 md:mb-12">
                            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">What We Print</h2>
                            <p className="font-sans-ui text-base md:text-lg text-zinc-600 max-w-2xl mx-auto">
                                From documents to marketing materials, we've got you covered.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { title: 'A4 Document', icon: <FileText size={32} />, color: 'blue' },
                                { title: 'Banner', icon: <Flag size={32} />, color: 'purple' },
                                { title: 'Stickers', icon: <Star size={32} />, color: 'amber' },
                                { title: 'Business Cards', icon: <CreditCard size={32} />, color: 'green' }
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleProductClick(item.title)}
                                    className="bg-white border-2 border-zinc-100 rounded-2xl md:rounded-3xl p-6 md:p-8 text-center hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 flex items-center justify-center text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="font-display text-lg md:text-xl font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                                    <p className="font-sans-ui text-xs md:text-sm text-zinc-500 mt-2">Fast & affordable</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- HOW IT WORKS SECTION --- */}
                    <div className="mb-24 md:mb-32">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">How It Works</h2>
                            <p className="font-sans-ui text-base md:text-lg text-zinc-600 max-w-2xl mx-auto">
                                Three simple steps to get your prints delivered.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {[
                                {
                                    step: '01',
                                    title: 'Upload',
                                    icon: <Layers size={24} />,
                                    desc: 'Upload your documents securely through our platform.',
                                },
                                {
                                    step: '02',
                                    title: 'Process',
                                    icon: <Activity size={24} />,
                                    desc: 'We print your documents at our local facility with quality checks.',
                                },
                                {
                                    step: '03',
                                    title: 'Deliver',
                                    icon: <Globe size={24} />,
                                    desc: 'Get your prints delivered to your doorstep in minutes.',
                                }
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-100 rounded-2xl md:rounded-3xl p-8 md:p-10 hover:shadow-lg transition-all duration-300">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                                {item.icon}
                                            </div>
                                            <span className="font-display text-5xl font-bold text-zinc-100 select-none">{item.step}</span>
                                        </div>

                                        <h3 className="font-display text-2xl md:text-3xl font-semibold mb-4 text-zinc-900">{item.title}</h3>
                                        <p className="font-sans-ui text-sm md:text-base text-zinc-600 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>

                                    {/* Connector line */}
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-zinc-200 to-transparent" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- STATS SECTION --- */}
                    <div className="mb-24 md:mb-32 bg-gradient-to-br from-zinc-50 to-white rounded-2xl md:rounded-3xl p-8 md:p-16 border border-zinc-100">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                                Trusted by Many
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {[
                                { label: 'Active Customers', value: '4,802+' },
                                { label: 'Documents Printed', value: '124K+' },
                                { label: 'Average Delivery', value: '15 min' }
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="font-display text-4xl md:text-5xl font-bold text-blue-600 mb-2 tracking-tight">
                                        {stat.value}
                                    </div>
                                    <div className="font-sans-ui text-sm md:text-base text-zinc-600 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- CALL TO ACTION --- */}
                    <div className="text-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl md:rounded-[3rem] py-16 md:py-24 px-6 md:px-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
                        </div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
                                Ready to start printing?
                            </h2>
                            <p className="font-sans-ui text-base md:text-lg text-zinc-300 mb-8 md:mb-12 max-w-xl mx-auto">
                                Join thousands of satisfied customers who trust us with their printing needs.
                            </p>
                            <button
                                onClick={onStart}
                                className="bg-white text-zinc-900 px-10 md:px-12 py-4 md:py-5 rounded-full font-sans-ui text-sm md:text-base font-bold hover:scale-105 transition-transform active:scale-95 shadow-2xl inline-flex items-center gap-3 group"
                            >
                                Get Started Now
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
