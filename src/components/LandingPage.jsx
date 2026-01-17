import React, { useState } from 'react';
import {
    ArrowRight,
    Upload,
    Activity,
    Globe,
    FileText,
    Flag,
    Star,
    CreditCard,
    Check,
    MapPin,
    Clock,
    Shield,
    Box,
    Terminal,
    Cpu,
    Zap,
    HardDrive,
    Share2,
    Lock,
    Layers,
    X
} from 'lucide-react';

const LandingPage = ({ onStart }) => {
    const [activeModule, setActiveModule] = useState(0);

    return (
        <>
            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-24 grid-bg overflow-hidden min-h-screen">
                <div className="absolute inset-0 scanline" />
                <div className="max-w-[1400px] mx-auto px-8 relative z-10">
                    <div className="flex flex-col items-start max-w-4xl">
                        <div className="mb-8 inline-flex items-center gap-3 bg-zinc-50 border border-zinc-100 px-4 py-2 rounded-lg">
                            <Cpu size={14} className="text-zinc-400" />
                            <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
                                Protocol V2.5.0: Nodes Operational
                            </span>
                        </div>

                        <h1 className="font-display text-6xl md:text-[7.5rem] font-bold tracking-tighter text-zinc-900 leading-[0.85] mb-12">
                            Decentralized <br />
                            <span className="text-zinc-300 italic pr-4">Fabrication.</span>
                        </h1>

                        <p className="font-sans-ui text-xl text-zinc-500 leading-relaxed max-w-2xl mb-12">
                            The world's first decentralized mesh for physical document delivery. Fast, local, and encrypted from upload to delivery.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={onStart}
                                className="bg-zinc-900 text-white px-8 py-5 rounded-2xl font-mono-tech text-[11px] font-bold uppercase tracking-widest hover:shadow-2xl hover:bg-zinc-800 transition-all flex items-center gap-4 group"
                            >
                                Start Printing <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="bg-white border border-zinc-100 text-zinc-900 px-8 py-5 rounded-2xl font-mono-tech text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all">
                                View Node Map
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="py-20 border-y border-zinc-100">
                <div className="max-w-[1400px] mx-auto px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { label: 'Active Nodes', value: '4,802', detail: 'Online Now' },
                            { label: 'Documents Printed', value: '124K', detail: 'Past 30 Days' },
                            { label: 'Avg Latency', value: '14.2s', detail: 'Queue Time' },
                            { label: 'Delivery Time', value: '15m', detail: 'Last Mile' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="font-mono-tech text-[10px] uppercase tracking-widest text-zinc-400 mb-2">{stat.label}</span>
                                <span className="font-display text-4xl font-bold text-zinc-900">{stat.value}</span>
                                <span className="font-mono-tech text-[9px] uppercase tracking-widest text-emerald-500 mt-1">{stat.detail}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- MODULES SECTION --- */}
            <section className="py-32 bg-zinc-50/50">
                <div className="max-w-[1400px] mx-auto px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div className="max-w-2xl">
                            <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-300 block mb-4">Core Modules</span>
                            <h2 className="font-display text-5xl font-bold tracking-tight">Precision engineering for <br /> every printed asset.</h2>
                        </div>
                        <div className="flex gap-2 bg-white p-1.5 rounded-full border border-zinc-100">
                            {['Documents', 'Banners', 'Identity'].map((tab, i) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveModule(i)}
                                    className={`px-6 py-2 rounded-full text-[10px] font-mono-tech uppercase tracking-widest transition-all ${activeModule === i ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <FileText size={24} />, title: 'A4 Protocol', desc: 'Standardized document output with 1200 DPI precision on multi-weight bond paper.', meta: 'from ₦50' },
                            { icon: <Layers size={24} />, title: 'Wide Format', desc: 'Large scale banners and flexible vinyl outputs using weather-resistant inks.', meta: 'from ₦5,000' },
                            { icon: <Zap size={24} />, title: 'Instant Nodes', desc: 'Self-service kiosks for immediate local fabrication of standard assets.', meta: 'Available' }
                        ].map((card, i) => (
                            <div key={i} className="bg-white p-10 rounded-[3rem] border border-zinc-100 hover:border-zinc-900 transition-all duration-500 group">
                                <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 mb-8 border border-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                    {card.icon}
                                </div>
                                <h3 className="font-display text-2xl font-bold mb-4">{card.title}</h3>
                                <p className="font-sans-ui text-zinc-500 text-sm leading-relaxed mb-8">{card.desc}</p>
                                <div className="pt-6 border-t border-zinc-50 flex justify-between items-center">
                                    <span className="font-mono-tech text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{card.meta}</span>
                                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- NETWORK SECTION --- */}
            <section className="py-32 overflow-hidden bg-zinc-900 text-white relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                <div className="max-w-[1400px] mx-auto px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600 block mb-6">Global Network</span>
                            <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-8">A resilient mesh of local fabrication nodes.</h2>
                            <p className="text-zinc-400 text-lg leading-relaxed mb-12">
                                Our network eliminates long-distance shipping. When you click print, your file is routed to the nearest available professional hub for instant production and hyper-local delivery.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: <Lock size={18} />, title: 'End-to-End Encryption', desc: 'Your files are wiped from nodes immediately after fabrication.' },
                                    { icon: <Share2 size={18} />, title: 'P2P Routing', desc: 'Optimal pathfinding for the fastest delivery times globally.' }
                                ].map((feat, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                                            {feat.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-display font-bold text-lg mb-1">{feat.title}</h4>
                                            <p className="text-zinc-500 text-sm">{feat.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-zinc-800/50 rounded-[4rem] border border-zinc-700/50 p-12 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/20 to-transparent" />
                                <Globe size={300} strokeWidth={0.5} className="text-zinc-700 animate-float opacity-50" />

                                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse" />
                                <div className="absolute top-1/2 right-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="py-32 max-w-[1400px] mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {[
                        { title: 'Secure Upload', icon: <Upload size={20} />, step: '01' },
                        { title: 'Local Forge', icon: <Activity size={20} />, step: '02' },
                        { title: 'Mesh Delivery', icon: <MapPin size={20} />, step: '03' }
                    ].map((step, i) => (
                        <div key={i} className="relative">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="font-mono-tech text-[10px] text-zinc-300 font-bold tracking-widest">{step.step}</span>
                                <div className="h-px bg-zinc-100 flex-1" />
                            </div>
                            <h4 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                                {step.icon} {step.title}
                            </h4>
                            <p className="font-sans-ui text-zinc-500 text-sm leading-relaxed">
                                Our protocol ensures your data is only accessible to the specific hardware node assigned to your request.
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-32 px-8">
                <div className="max-w-[1400px] mx-auto bg-zinc-900 rounded-[4rem] p-24 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-grid-white/[0.05]" />
                    <div className="relative z-10">
                        <h2 className="font-display text-5xl md:text-7xl font-bold text-white mb-8">Initialize Fabricator.</h2>
                        <button
                            onClick={onStart}
                            className="bg-white text-zinc-900 px-12 py-5 rounded-2xl font-mono-tech text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                        >
                            Start Printing
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default LandingPage;
