import React, { useEffect, useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Upload, Bike, Footprints, X, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';


// --- Customer Wallet Component ---
const CustomerWallet = ({ orders, user }) => {
    const [showTopUp, setShowTopUp] = useState(false);
    const [amount, setAmount] = useState("");
    const [deposits, setDeposits] = useState([]);

    // Mock Top Up
    const handleTopUp = (e) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!val || val <= 0) return;

        const newDeposit = {
            id: `dep-${Date.now()}`,
            type: 'credit',
            amount: val,
            status: 'Success',
            createdAt: new Date(),
            description: 'Wallet Funding'
        };
        setDeposits([newDeposit, ...deposits]);
        setAmount("");
        setShowTopUp(false);
    };

    // Merge deposits (credits) and Orders (debits)
    const transactions = [
        ...deposits,
        ...orders.map(o => ({
            id: o.id,
            type: 'debit',
            amount: o.totalPrice || 0,
            status: 'Completed',
            createdAt: o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt?.seconds * 1000 || Date.now()),
            description: `Order: ${o.productName || o.fileName}`
        }))
    ].sort((a, b) => b.createdAt - a.createdAt);

    const balance = deposits.reduce((acc, d) => acc + d.amount, 0) - orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    const displayBalance = Math.max(0, balance);

    return (
        <div className="animate-fade-in-up space-y-8">
            {/* Customer Wallet Card - Redesigned */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 text-white shadow-2xl p-10 transition-transform group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-zinc-700/50 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-800/30 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-10">
                        <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-mono-tech uppercase tracking-widest border border-white/10">Standard Protocol</span>
                        <Wallet className="text-zinc-400" />
                    </div>

                    <p className="text-zinc-400 text-[10px] font-mono-tech uppercase tracking-[0.2em] mb-2">Available Credits</p>
                    <h2 className="font-display text-6xl font-bold mb-10 tracking-tight">₦{displayBalance.toLocaleString()}</h2>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowTopUp(true)}
                            className="flex-1 bg-white text-zinc-900 py-4 px-6 rounded-2xl font-mono-tech text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                        >
                            <Plus size={16} /> Fund Wallet
                        </button>
                        <button className="px-8 py-4 rounded-2xl font-mono-tech text-xs font-bold uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 backdrop-blur-sm transition text-zinc-300">
                            Scan Node
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div>
                <h3 className="font-display text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-zinc-400" /> Activity Log
                </h3>
                <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                                <Wallet size={24} />
                            </div>
                            <p className="font-mono-tech text-xs text-zinc-400 uppercase tracking-widest">No wallet activity recorded</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-50">
                            {transactions.map(txn => (
                                <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-zinc-50/50 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${txn.type === 'credit' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-zinc-50 border-zinc-100 text-zinc-400'
                                            }`}>
                                            {txn.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900 text-sm mb-1">{txn.description}</p>
                                            <p className="font-mono-tech text-[10px] text-zinc-400 uppercase">{txn.createdAt.toDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-display font-bold text-lg ${txn.type === 'credit' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                                            {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Up Modal */}
            {showTopUp && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fund Wallet</h3>
                            <button onClick={() => setShowTopUp(false)} className="text-gray-400">✕</button>
                        </div>
                        <form onSubmit={handleTopUp}>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount to add</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full text-3xl font-bold border-b-2 border-gray-200 dark:border-gray-700 py-2 bg-transparent dark:text-white focus:outline-none focus:border-blue-600"
                                    placeholder="0.00" autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                {[1000, 5000, 10000].map(val => (
                                    <button key={val} type="button" onClick={() => setAmount(val)} className="py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        ₦{val.toLocaleString()}
                                    </button>
                                ))}
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700">Pay with Card</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- CreateOrder Component ---
const CreateOrder = ({ user, onClose }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [config, setConfig] = useState({
        copies: 1,
        color: 'bw', // bw or color
        paperType: 'A4',
        deliveryMethod: 'pickup', // pickup or delivery
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pricing Constants
    const PRICE_BW = 50;
    const PRICE_COLOR = 200;
    const DELIVERY_FEE = 500;

    const calculateTotal = () => {
        const printCost = config.copies * (config.color === 'bw' ? PRICE_BW : PRICE_COLOR);
        const deliveryCost = config.deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
        return printCost + deliveryCost;
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!user || !db) return;
        setIsSubmitting(true);

        try {
            // Use dummy URL for testing printer
            const mockUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

            await addDoc(collection(db, "orders"), {
                userId: user.uid,
                userEmail: user.email || "Guest",
                fileName: file ? file.name : "Document.pdf",
                fileUrl: mockUrl,
                status: "Paid", // Triggers printer bot
                createdAt: serverTimestamp(),

                paperType: config.paperType,
                color: config.color,
                quantity: config.copies,

                deliveryMethod: config.deliveryMethod,
                deliveryFee: config.deliveryMethod === 'delivery' ? DELIVERY_FEE : 0,
                address: config.deliveryMethod === 'delivery' ? config.address : "Pick Up @ Shop",

                totalPrice: calculateTotal(),
                paymentRef: `PAY-${Date.now()}`
            });

            alert("Order Placed Successfully! Your printer should start soon.");
            onClose();
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-zinc-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="font-display text-lg font-bold text-zinc-900">New Print Job</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:bg-zinc-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {/* Step 1: File Upload */}
                    <div className="mb-8">
                        <label className="block text-xs font-mono-tech font-bold text-zinc-500 uppercase tracking-widest mb-3">1. Upload Document</label>
                        <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center hover:border-zinc-900 hover:bg-zinc-50 transition-all cursor-pointer group">
                            <input type="file" id="file-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                <div className="w-14 h-14 bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                    <Upload size={24} strokeWidth={1.5} />
                                </div>
                                <span className="font-display font-bold text-zinc-900">{file ? file.name : "Click to Upload PDF"}</span>
                                <span className="font-sans text-xs text-zinc-400">Max size 10MB • PDF, DOCX</span>
                            </label>
                        </div>
                    </div>

                    {/* Step 2: Settings */}
                    <div className="mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-zinc-200 rounded-2xl transition hover:border-zinc-300">
                                <span className="text-xs font-mono-tech text-zinc-400 block uppercase tracking-wider mb-2">Copies</span>
                                <div className="flex items-center justify-between bg-zinc-50 rounded-lg p-1">
                                    <button onClick={() => setConfig({ ...config, copies: Math.max(1, config.copies - 1) })} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:text-zinc-900 text-zinc-500">-</button>
                                    <span className="font-mono-tech font-bold text-zinc-900">{config.copies}</span>
                                    <button onClick={() => setConfig({ ...config, copies: config.copies + 1 })} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:text-zinc-900 text-zinc-500">+</button>
                                </div>
                            </div>
                            <div className="p-4 border border-zinc-200 rounded-2xl transition hover:border-zinc-300">
                                <span className="text-xs font-mono-tech text-zinc-400 block uppercase tracking-wider mb-2">Color Mode</span>
                                <div className="flex gap-1 bg-zinc-50 rounded-lg p-1">
                                    <button onClick={() => setConfig({ ...config, color: 'bw' })} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${config.color === 'bw' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>B&W</button>
                                    <button onClick={() => setConfig({ ...config, color: 'color' })} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${config.color === 'color' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>Color</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Delivery Method */}
                    <div className="mb-4">
                        <label className="block text-xs font-mono-tech font-bold text-zinc-500 uppercase tracking-widest mb-3">3. Delivery Method</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfig({ ...config, deliveryMethod: 'pickup' })}
                                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${config.deliveryMethod === 'pickup' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 text-zinc-500 hover:border-zinc-300'}`}
                            >
                                <Footprints size={24} />
                                <div className="text-center">
                                    <span className="font-bold text-sm block">Pick Up</span>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold ${config.deliveryMethod === 'pickup' ? 'text-emerald-400' : 'text-emerald-600'}`}>Free</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setConfig({ ...config, deliveryMethod: 'delivery' })}
                                className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${config.deliveryMethod === 'delivery' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 text-zinc-500 hover:border-zinc-300'}`}
                            >
                                <Bike size={24} />
                                <div className="text-center">
                                    <span className="font-bold text-sm block">Delivery</span>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold ${config.deliveryMethod === 'delivery' ? 'text-zinc-400' : 'text-zinc-400'}`}>+₦{DELIVERY_FEE}</span>
                                </div>
                            </button>
                        </div>
                        {config.deliveryMethod === 'delivery' && (
                            <div className="mt-6 animate-fade-in-up">
                                <label className="text-xs font-mono-tech uppercase tracking-wider text-zinc-500 mb-2 block">Delivery Location</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Eni Njoku Hall, Room A201"
                                    className="w-full p-4 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition"
                                    value={config.address}
                                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-mono-tech uppercase text-zinc-500 tracking-wider mb-1">Total Estimate</p>
                        <p className="text-3xl font-display font-bold text-zinc-900">₦{calculateTotal().toLocaleString()}</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!file || isSubmitting}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-xl font-mono-tech text-xs font-bold uppercase tracking-widest shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                    >
                        {isSubmitting ? "Processing..." : "Pay & Print"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Customer Component ---
export default function CustomerDashboard({ onBack = () => { }, user }) {
    const [internalUser, setInternalUser] = useState(null);
    const currentUser = user || internalUser;
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewOrder, setShowNewOrder] = useState(false);

    // Auth & Data Fetching (Similar robust pattern as Vendor)
    useEffect(() => {
        if (!auth) return;
        const init = async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                try { await signInWithCustomToken(auth, __initial_auth_token); } catch (e) { await signInAnonymously(auth); }
            } else { await signInAnonymously(auth); }
        };
        init();
        const unsub = onAuthStateChanged(auth, setInternalUser);
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!currentUser || !db) return;
        // For demo, fetching all orders, typically would filter by user.uid
        const q = query(collection(db, "orders"));
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort
            list.sort((a, b) => {
                const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
                const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
                return tb - ta;
            });
            setOrders(list);
            setLoading(false);
        });
        return () => unsub();
    }, [currentUser]);

    if (!db || !currentUser) return <div className="p-10 text-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto"></div></div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 font-sans-ui text-zinc-900 min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-2xl font-display font-bold text-zinc-900 tracking-tight">Dashboard</h1>
                    <p className="text-zinc-500 text-sm">Welcome back</p>
                </div>
                <button onClick={onBack} className="text-xs font-mono-tech uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors">Log Out</button>
            </div>

            {/* Primary Action */}
            <div className="mb-12">
                <button
                    onClick={() => setShowNewOrder(true)}
                    className="w-full bg-zinc-900 hover:bg-black text-white py-6 rounded-[2rem] font-display text-xl font-bold shadow-2xl hover:shadow-xl flex items-center justify-center gap-4 transition-all transform active:scale-[0.99] group"
                >
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                        <Plus className="text-white" />
                    </div>
                    Start New Print Job
                </button>
            </div>

            <div className="flex gap-8 border-b border-zinc-100 mb-8 overflow-x-auto">
                <button onClick={() => setActiveTab('orders')} className={`pb-4 px-2 font-mono-tech text-xs font-bold uppercase tracking-widest border-b-2 transition ${activeTab === 'orders' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>My Orders</button>
                <button onClick={() => setActiveTab('wallet')} className={`pb-4 px-2 font-mono-tech text-xs font-bold uppercase tracking-widest border-b-2 transition flex items-center gap-2 ${activeTab === 'wallet' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>
                    <Wallet size={14} /> Wallet
                </button>
            </div>

            {/* Content */}
            {activeTab === 'orders' ? (
                <div className="space-y-4 animate-fade-in-up">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-mono-tech text-xs text-zinc-400 uppercase tracking-widest">Sycing Protocol...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-zinc-300">
                                <FileText size={24} />
                            </div>
                            <p className="font-display font-bold text-zinc-900 mb-2">No Active Jobs</p>
                            <p className="text-zinc-500 text-sm mb-6">Your print queue is currently empty.</p>
                            <button onClick={() => setShowNewOrder(true)} className="text-zinc-900 font-bold text-sm underline hover:text-blue-600">Start your first print</button>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-lg hover:border-zinc-200 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.deliveryMethod === 'pickup' ? 'bg-zinc-100 text-zinc-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {order.deliveryMethod === 'pickup' ? <Footprints size={20} /> : <Bike size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900 text-lg">{order.fileName || "Document"}</h4>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                                                <span>{order.quantity} Copies</span>
                                                <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                <span className="uppercase">{order.deliveryMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono-tech font-bold uppercase tracking-wider ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                        order.status === 'Printing' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-50 text-amber-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="flex justify-between items-end border-t border-zinc-50 pt-4 mt-2">
                                    <p className="text-[10px] font-mono-tech text-zinc-400 uppercase tracking-wider">ID: #{order.id.slice(0, 6)}</p>
                                    <p className="font-display font-bold text-xl text-zinc-900">₦{order.totalPrice?.toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <CustomerWallet orders={orders} user={currentUser} />
            )}

            {/* Modal */}
            {showNewOrder && <CreateOrder user={currentUser} onClose={() => setShowNewOrder(false)} />}
        </div>
    );
}