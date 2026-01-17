import React, { useState, useEffect } from 'react';
import {
    Printer,
    ArrowRight,
    Layers,
    Activity,
    Globe,
    FileText,
    Flag,
    Star,
    CreditCard,
    Menu,
    X,
    Store,
    Bike,
    ShieldCheck,
    Users,
    TrendingUp,
    Clock,
    DollarSign
} from 'lucide-react';

const LandingPage = ({ onStart, notificationCount = 0, user, onLogin, onMyOrders }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'careers'

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            const sections = ['home', 'services', 'how-it-works', 'pricing', 'about'];
            const scrollPosition = window.scrollY + 150;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
                    setActiveSection(section);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setMobileMenuOpen(false);
        }
    };

    const navigateToCareers = () => {
        setCurrentPage('careers');
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navigateToHome = () => {
        setCurrentPage('home');
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStartPrinting = () => {
        if (onStart) onStart();
    };

    // Careers Page Component
    if (currentPage === 'careers') {
        return (
            <div className="min-h-screen bg-white text-zinc-900">
                <style dangerouslySetInnerHTML={{
                    __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
          
          * { font-family: 'Inter', sans-serif; }
          .font-display { font-family: 'Space Grotesk', sans-serif; }

          .glass-nav {
            backdrop-filter: blur(16px);
            background: rgba(255, 255, 255, 0.95);
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          }

          *:focus-visible {
            outline: 3px solid #2563EB;
            outline-offset: 2px;
            border-radius: 4px;
          }
        `}} />

                {/* Navigation */}
                <nav className="fixed top-0 w-full z-[100] py-4 bg-white glass-nav shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <button
                            onClick={navigateToHome}
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center rounded-lg shadow-sm">
                                <Printer size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="font-display text-lg font-bold tracking-tight">PrintDeck</span>
                        </button>

                        <button
                            onClick={navigateToHome}
                            className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </nav>

                {/* Careers Content */}
                <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 lg:mb-16">
                            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 mb-4">Join Our Network</h1>
                            <p className="text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto px-4">
                                Multiple ways to earn and grow with PrintDeck
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {[
                                {
                                    title: 'Become a Vendor',
                                    icon: <Store size={32} />,
                                    desc: 'Set up your own printing shop and serve customers in your area.',
                                    benefits: ['Flexible hours', 'Your own pricing', 'Weekly payouts'],
                                    color: 'blue',
                                    buttonText: 'Apply Now',
                                    buttonAction: () => alert('Redirecting to Vendor Application Form...\n\nThis would take you to:\n/vendor/apply\n\nWhere vendors can:\n• Register their printing shop\n• Upload business documents\n• Set pricing and availability\n• Complete onboarding')
                                },
                                {
                                    title: 'Deliver with Us',
                                    icon: <Bike size={32} />,
                                    desc: 'Earn money delivering prints on your schedule with your vehicle.',
                                    benefits: ['Daily earnings', 'Choose your routes', 'Instant cash-out'],
                                    color: 'green',
                                    buttonText: 'Apply Now',
                                    buttonAction: () => alert('Redirecting to Rider Application Form...\n\nThis would take you to:\n/rider/apply\n\nWhere riders can:\n• Register as a delivery partner\n• Upload vehicle documents\n• Complete background verification\n• Start earning')
                                },
                                {
                                    title: 'Admin Operations',
                                    icon: <ShieldCheck size={32} />,
                                    desc: 'Manage quality control, customer support, and platform operations.',
                                    benefits: ['Stable income', 'Benefits package', 'Career growth'],
                                    color: 'purple',
                                    buttonText: 'Admin Access',
                                    buttonAction: () => alert('Opening Admin Login...\n\nThis would take you to:\n/admin/login\n\nRestricted access for:\n• Platform administrators\n• Operations managers\n• Support staff\n\nRequires admin credentials.')
                                }
                            ].map((program, i) => (
                                <div key={i} className="bg-white border-2 border-zinc-100 rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:border-blue-600 hover:shadow-xl transition-all duration-300 group">
                                    <div className={`w-16 h-16 mb-6 rounded-2xl bg-${program.color}-50 flex items-center justify-center text-${program.color}-600 group-hover:scale-110 transition-transform`}>
                                        {program.icon}
                                    </div>

                                    <h3 className="font-display text-xl lg:text-2xl font-bold text-zinc-900 mb-3">{program.title}</h3>
                                    <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{program.desc}</p>

                                    <div className="space-y-2 mb-6">
                                        {program.benefits.map((benefit, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-zinc-600">
                                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                                <span>{benefit}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={program.buttonAction}
                                        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 group-hover:gap-3 ${program.title === 'Admin Operations'
                                                ? 'bg-purple-600 text-white hover:bg-purple-700 border-2 border-purple-600'
                                                : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                            }`}
                                    >
                                        {program.buttonText}
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }

        .glass-nav {
          backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }

        html { scroll-behavior: smooth; overflow-y: scroll; }
        
        *:focus-visible {
          outline: 3px solid #2563EB;
          outline-offset: 2px;
          border-radius: 4px;
        }
      `}} />

            {/* --- NAVIGATION --- */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'py-3 glass-nav shadow-sm' : 'py-4 bg-white'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <button
                        onClick={() => scrollToSection('home')}
                        className="flex items-center gap-2.5 group"
                        aria-label="PrintDeck home"
                    >
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                            <Printer size={18} className="text-white" strokeWidth={2.5} />
                        </div>
                        <span className="font-display text-lg font-bold tracking-tight">PrintDeck</span>
                    </button>

                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { id: 'services', label: 'Services' },
                            { id: 'pricing', label: 'Pricing' },
                            { id: 'about', label: 'About' }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`text-sm font-medium transition-colors relative pb-1 ${activeSection === item.id
                                        ? 'text-blue-600'
                                        : 'text-zinc-600 hover:text-zinc-900'
                                    }`}
                            >
                                {item.label}
                                {activeSection === item.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {!user ? (
                            <button
                                onClick={onLogin}
                                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors px-4 py-2"
                            >
                                Login
                            </button>
                        ) : (
                            <span className="text-sm font-medium text-zinc-600 px-2 truncate max-w-[150px]">
                                {user.email}
                            </span>
                        )}

                        <button
                            onClick={onMyOrders}
                            className="bg-zinc-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-sm flex items-center gap-2"
                        >
                            My Orders
                            {notificationCount > 0 && (
                                <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{notificationCount}</span>
                            )}
                        </button>
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-zinc-100 animate-fadeIn">
                        <div className="px-4 py-4 space-y-3">
                            {[
                                { id: 'services', label: 'Services' },
                                { id: 'pricing', label: 'Pricing' },
                                { id: 'about', label: 'About' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`block w-full text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${activeSection === item.id
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-zinc-600 hover:bg-zinc-50'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                            {!user && (
                                <button
                                    onClick={onLogin}
                                    className="w-full text-left px-4 py-2.5 rounded-lg font-medium text-zinc-600 hover:bg-zinc-50"
                                >
                                    Login
                                </button>
                            )}
                            <button
                                onClick={onMyOrders}
                                className="w-full bg-zinc-900 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-between"
                            >
                                My Orders
                                {notificationCount > 0 && <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{notificationCount}</span>}
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* --- HERO SECTION --- */}
            <main className="pt-20" id="home">
                <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-2xl lg:rounded-[2.5rem] mx-4 sm:mx-6 lg:mx-8 my-8 py-16 sm:py-24 lg:py-32 px-6 sm:px-12 lg:px-16 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full blur-3xl animate-pulse-slow" />
                        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-400 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 sm:mb-8">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs sm:text-sm font-medium text-white/90">Same-Day Delivery Available</span>
                        </div>

                        <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight">
                            Print Anything,<br /> Delivered Fast.
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 text-blue-50 max-w-2xl mx-auto leading-relaxed px-4">
                            Upload documents from your room and get them delivered in minutes. Professional quality, affordable prices.
                        </p>
                        <button
                            onClick={handleStartPrinting}
                            className="bg-white text-blue-600 px-8 sm:px-12 py-4 sm:py-5 rounded-full text-sm sm:text-base font-bold hover:scale-105 transition-transform active:scale-95 shadow-2xl inline-flex items-center gap-3 group"
                        >
                            Start Printing
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 lg:pb-32">
                    {/* --- SERVICES SECTION --- */}
                    <div className="mb-20 lg:mb-32 pt-12" id="services">
                        <div className="text-center mb-10 lg:mb-12">
                            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">What We Print</h2>
                            <p className="text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto px-4">
                                From documents to marketing materials, we've got you covered.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            {[
                                { title: 'A4 Document', icon: <FileText size={28} />, price: 'From ₦50/page' },
                                { title: 'Banner', icon: <Flag size={28} />, price: 'From ₦5,000' },
                                { title: 'Stickers', icon: <Star size={28} />, price: 'From ₦2,000' },
                                { title: 'Business Cards', icon: <CreditCard size={28} />, price: 'From ₦8,000' }
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    onClick={handleStartPrinting}
                                    className="bg-white border-2 border-zinc-100 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-center hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300 group"
                                >
                                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-display text-lg lg:text-xl font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors mb-2">{item.title}</h3>
                                    <p className="text-sm text-blue-600 font-semibold">{item.price}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- HOW IT WORKS --- */}
                    <div className="mb-20 lg:mb-32" id="how-it-works">
                        <div className="text-center mb-12 lg:mb-16">
                            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">How It Works</h2>
                            <p className="text-base lg:text-lg text-zinc-600 max-w-2xl mx-auto px-4">
                                Three simple steps to get your prints delivered.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                            {[
                                { step: '01', title: 'Upload', icon: <Layers size={24} />, desc: 'Upload your files securely. Supports PDF, DOCX, JPG, and more.' },
                                { step: '02', title: 'Customize', icon: <Activity size={24} />, desc: 'Choose paper size, color options, and quantity with live preview.' },
                                { step: '03', title: 'Deliver', icon: <Globe size={24} />, desc: 'Fast delivery to your location. Track your order in real-time.' }
                            ].map((item, i) => (
                                <div key={i} className="bg-gradient-to-br from-zinc-50 to-white border border-zinc-100 rounded-2xl lg:rounded-3xl p-6 lg:p-10 hover:shadow-lg transition-all">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                            {item.icon}
                                        </div>
                                        <span className="font-display text-4xl sm:text-5xl font-bold text-zinc-100">{item.step}</span>
                                    </div>

                                    <h3 className="font-display text-2xl lg:text-3xl font-semibold mb-3 text-zinc-900">{item.title}</h3>
                                    <p className="text-sm lg:text-base text-zinc-600 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- PRICING/STATS --- */}
                    <div className="mb-20 lg:mb-32 bg-gradient-to-br from-zinc-50 to-white rounded-2xl lg:rounded-3xl p-8 lg:p-16 border border-zinc-100" id="pricing">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Trusted by Many</h2>
                            <p className="text-base lg:text-lg text-zinc-600">Join thousands of satisfied customers</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
                            {[
                                { label: 'Active Customers', value: '4,802+' },
                                { label: 'Documents Printed', value: '124K+' },
                                { label: 'Average Delivery', value: '15 min' }
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="font-display text-4xl lg:text-5xl font-bold text-blue-600 mb-2">{stat.value}</div>
                                    <div className="text-sm lg:text-base text-zinc-600 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- ABOUT SECTION --- */}
                    <div className="mb-20 lg:mb-32" id="about">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mb-6">About PrintDeck</h2>
                            <p className="text-base lg:text-lg text-zinc-600 leading-relaxed mb-8">
                                We're revolutionizing the printing industry by connecting customers with local printing services through our innovative platform. Fast, reliable, and affordable - that's our promise.
                            </p>
                            <button
                                onClick={navigateToCareers}
                                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
                            >
                                Join Our Network
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* --- CTA --- */}
                    <div className="text-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl lg:rounded-[2.5rem] py-16 lg:py-24 px-6 lg:px-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                        </div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">Ready to start printing?</h2>
                            <p className="text-base lg:text-lg text-zinc-300 mb-8 lg:mb-12 max-w-xl mx-auto px-4">
                                Join thousands of satisfied customers who trust us with their printing needs.
                            </p>
                            <button
                                onClick={handleStartPrinting}
                                className="bg-white text-zinc-900 px-10 sm:px-12 py-4 sm:py-5 rounded-full text-sm sm:text-base font-bold hover:scale-105 transition-transform active:scale-95 shadow-2xl inline-flex items-center gap-3 group"
                            >
                                Get Started Now
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-7xl mx-auto border-t border-zinc-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center rounded-lg">
                                <Printer size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="font-display text-xl font-bold">PrintDeck</span>
                        </div>
                        <p className="text-sm text-zinc-600 max-w-sm leading-relaxed mb-6">
                            Fast, reliable, and affordable printing services delivered right to your doorstep.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wide">Company</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'About Us', action: () => scrollToSection('about') },
                                { label: 'Careers', action: navigateToCareers },
                                { label: 'Contact', action: () => alert('Opening contact form...') }
                            ].map(link => (
                                <button
                                    key={link.label}
                                    onClick={link.action}
                                    className="block text-sm text-zinc-600 hover:text-blue-600 transition-colors"
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wide">Legal</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Privacy', action: () => alert('Opening Privacy Policy...') },
                                { label: 'Terms', action: () => alert('Opening Terms of Service...') },
                                { label: 'Security', action: () => alert('Opening Security page...') }
                            ].map(link => (
                                <button
                                    key={link.label}
                                    onClick={link.action}
                                    className="block text-sm text-zinc-600 hover:text-blue-600 transition-colors"
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-zinc-500">© 2026 PrintDeck. All rights reserved.</p>
                    <div className="flex gap-6">
                        {[
                            { label: 'Twitter', action: () => window.open('https://twitter.com', '_blank') },
                            { label: 'Instagram', action: () => window.open('https://instagram.com', '_blank') },
                            { label: 'LinkedIn', action: () => window.open('https://linkedin.com', '_blank') }
                        ].map(social => (
                            <button
                                key={social.label}
                                onClick={social.action}
                                className="text-sm text-zinc-500 hover:text-blue-600 transition-colors"
                            >
                                {social.label}
                            </button>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
