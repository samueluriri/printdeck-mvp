import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, onSnapshot, doc, updateDoc, getDoc, where, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from "firebase/auth";

import { Bike, Navigation, ChevronRight, CheckCircle, MapPin, Package, Wallet, ArrowDownLeft, TrendingUp, X } from 'lucide-react';

// --- Rider Wallet Component ---
const RiderWallet = ({ deliveries }) => {
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawals, setWithdrawals] = useState([]);

    // Calculate Earnings (Using deliveryFee from order or default 500)
    const earnings = deliveries.map(d => ({
        id: d.id,
        amount: d.deliveryFee || 500,
        createdAt: d.createdAt,
        description: `Delivery: ${d.productName}`
    }));

    const totalEarned = earnings.reduce((acc, e) => acc + e.amount, 0);
    const currentBalance = totalEarned - withdrawals.reduce((acc, w) => acc + w.amount, 0);

    const handleWithdraw = (e) => {
        e.preventDefault();
        const val = parseFloat(withdrawAmount);
        if (!val || val <= 0) return alert("Enter valid amount");
        if (val > currentBalance) return alert("Insufficient funds");

        setWithdrawals([{
            id: Date.now(),
            amount: val,
            createdAt: new Date(),
            status: 'Processing',
            description: 'Withdrawal to Bank'
        }, ...withdrawals]);
        setWithdrawOpen(false);
        setWithdrawAmount("");
        alert("Withdrawal initiated successfully!");
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Wallet Card */}
            <div className="bg-zinc-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-zinc-800 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 group-hover:bg-zinc-700 transition-colors"></div>
                <div className="relative z-10">
                    <p className="text-zinc-400 text-[10px] font-mono-tech uppercase font-bold tracking-widest mb-2">Total Earnings</p>
                    <h1 className="text-5xl font-display font-bold mb-8 tracking-tight">₦{currentBalance.toLocaleString()}</h1>
                    <button onClick={() => setWithdrawOpen(true)} className="w-full py-4 bg-white hover:bg-zinc-100 text-zinc-900 font-mono-tech text-xs font-bold uppercase tracking-widest rounded-2xl transition shadow-lg active:scale-95 flex items-center justify-center gap-2">
                        <Wallet size={16} /> Withdraw to Bank
                    </button>
                </div>
            </div>

            {/* History List */}
            <div>
                <h3 className="font-display font-bold text-zinc-900 text-lg mb-4 flex items-center gap-2"><TrendingUp size={18} /> Earnings History</h3>
                <div className="bg-white border border-zinc-100 rounded-[1.5rem] overflow-hidden shadow-sm">
                    {withdrawals.length === 0 && earnings.length === 0 && (
                        <div className="p-12 text-center text-zinc-400 font-mono-tech text-xs uppercase tracking-widest">
                            No earnings record found.
                        </div>
                    )}
                    {[...withdrawals.map(w => ({ ...w, type: 'debit' })), ...earnings.map(e => ({ ...e, type: 'credit' }))]
                        .sort((a, b) => {
                            const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
                            const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
                            return dateB - dateA;
                        })
                        .map((txn, i) => (
                            <div key={i} className="p-5 flex justify-between items-center border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'debit' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {txn.type === 'debit' ? <ArrowDownLeft size={18} /> : <TrendingUp size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-zinc-900">{txn.type === 'debit' ? 'Withdrawal' : txn.description}</p>
                                        <p className="text-[10px] font-mono-tech text-zinc-400 uppercase">
                                            {txn.createdAt?.seconds
                                                ? new Date(txn.createdAt.seconds * 1000).toLocaleDateString()
                                                : new Date(txn.createdAt || 0).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-display font-bold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-zinc-900'}`}>
                                    {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Withdraw Modal */}
            {withdrawOpen && (
                <div className="fixed inset-0 bg-zinc-900/80 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display font-bold text-xl text-zinc-900">Withdraw Funds</h3>
                            <button onClick={() => setWithdrawOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X size={24} /></button>
                        </div>

                        <div className="bg-zinc-50 rounded-2xl p-4 mb-6 border border-zinc-100">
                            <p className="text-[10px] font-mono-tech text-zinc-500 uppercase tracking-widest mb-1">Available Balance</p>
                            <p className="text-2xl font-bold text-zinc-900">₦{currentBalance.toLocaleString()}</p>
                        </div>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Amount</label>
                            <input
                                type="number"
                                value={withdrawAmount}
                                onChange={e => setWithdrawAmount(e.target.value)}
                                className="w-full p-4 border border-zinc-200 rounded-xl text-xl font-bold bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setWithdrawOpen(false)} className="flex-1 py-4 font-mono-tech text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl uppercase tracking-widest transition">Cancel</button>
                            <button onClick={handleWithdraw} className="flex-1 py-4 bg-zinc-900 text-white font-mono-tech text-xs font-bold rounded-xl uppercase tracking-widest hover:bg-black transition shadow-lg active:scale-95">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Rider Component ---
export default function RiderDashboard({ onBack = () => { }, user }) {
    const [internalUser, setInternalUser] = useState(null);
    const currentUser = user || internalUser;

    const [activeTab, setActiveTab] = useState('deliveries');
    const [orders, setOrders] = useState([]);
    const [gpsActive, setGpsActive] = useState(false);
    const [riderVehicleType, setRiderVehicleType] = useState('Motorcycle');

    // 1. Auth & Rider Profile
    useEffect(() => {
        if (!auth) return;
        const init = async () => {
            try { if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token); else await signInAnonymously(auth); } catch (e) { }
        };
        init();
        const unsub = onAuthStateChanged(auth, async (u) => {
            setInternalUser(u);
            if (u && db) {
                // Fetch profile for vehicle type
                try {
                    const userDoc = await getDoc(doc(db, "users", u.uid));
                    if (userDoc.exists()) {
                        setRiderVehicleType(userDoc.data().vehicleType || 'Motorcycle');
                    }
                } catch (e) { console.warn("Profile fetch error", e); }
            }
        });
        return () => unsub();
    }, []);

    // 2. GPS Tracking
    useEffect(() => {
        if (!currentUser || !db || !navigator.geolocation) return;

        const success = (position) => {
            setGpsActive(true);
            const { latitude, longitude } = position.coords;
            // Update DB
            updateDoc(doc(db, "users", currentUser.uid), {
                currentLocation: { lat: latitude, lng: longitude },
                lastLocationUpdate: new Date()
            }).catch(e => { }); // Silent fail ok
        };

        const error = () => setGpsActive(false);

        const id = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
        return () => navigator.geolocation.clearWatch(id);
    }, [currentUser]);

    // 3. Real-time Orders
    useEffect(() => {
        if (!db || !currentUser) return;
        const q = query(collection(db, "orders"));
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setOrders(list);
        });
        return () => unsub();
    }, [currentUser]);

    // Helper Functions
    const openNavigation = (address) => {
        const destination = address || "Unilag Main Gate, Lagos, Nigeria";
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
        window.open(url, '_blank');
    };

    const acceptJob = async (orderId) => {
        if (!db || !currentUser) return;
        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: "Out for Delivery",
                riderId: currentUser.uid
            });
        } catch (e) { alert("Error accepting job: " + e.message); }
    };

    const completeJob = async (orderId) => {
        if (!db) return;
        const confirm = window.confirm("Confirm delivery completion?");
        if (!confirm) return;
        try {
            await updateDoc(doc(db, "orders", orderId), {
                status: "Completed",
                deliveredAt: new Date()
            });
        } catch (e) { alert("Error completing job"); }
    };

    // Filtering Logic
    const availableDeliveries = orders.filter(o => {
        // 1. Must be ready
        if (o.status !== 'Ready for Pickup') return false;
        // 2. Vehicle Constraint (e.g., Bicycle < 5km)
        if (riderVehicleType === 'Bicycle') {
            const dist = parseFloat((o.vendorDistance || "0").toString().replace('km', ''));
            if (dist > 5) return false;
        }
        return true;
    });

    const myActiveJobs = orders.filter(o => o.riderId === currentUser?.uid && o.status === 'Out for Delivery');
    const completedDeliveries = orders.filter(o => o.riderId === currentUser?.uid && o.status === 'Completed');

    if (!db || !currentUser) return <div className="min-h-screen flex justify-center items-center bg-white"><div className="w-8 h-8 border-4 border-zinc-900 rounded-full animate-spin border-t-transparent"></div></div>;

    return (
        <div className="max-w-md mx-auto bg-zinc-50 min-h-screen font-sans-ui pb-32">
            {/* Header */}
            <div className="bg-white p-6 sticky top-0 z-20 shadow-sm flex justify-between items-center border-b border-zinc-100/50 backdrop-blur-md bg-white/90">
                <div>
                    <h1 className="text-xl font-display font-bold text-zinc-900 flex items-center gap-2 tracking-tight"><Bike className="text-zinc-900" /> RIDER OS</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className="text-[10px] font-mono-tech font-bold text-zinc-400 uppercase tracking-widest">{gpsActive ? 'GPS ONLINE' : 'NO SIGNAL'}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-full font-mono-tech font-bold uppercase tracking-widest border border-zinc-200">{riderVehicleType}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 bg-white border-b border-zinc-100">
                <button onClick={() => setActiveTab('deliveries')} className={`py-4 text-xs font-mono-tech font-bold uppercase tracking-widest border-b-2 transition ${activeTab === 'deliveries' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>Deliveries</button>
                <button onClick={() => setActiveTab('wallet')} className={`py-4 text-xs font-mono-tech font-bold uppercase tracking-widest border-b-2 transition ${activeTab === 'wallet' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}>Earnings</button>
            </div>

            <div className="p-6">
                {activeTab === 'wallet' ? (
                    <RiderWallet deliveries={completedDeliveries} />
                ) : (
                    <div className="space-y-6">
                        {/* Active Jobs Section */}
                        {myActiveJobs.length > 0 && (
                            <div className="animate-fade-in-up">
                                <h3 className="text-[10px] font-mono-tech font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Current Job</h3>
                                {myActiveJobs.map(job => (
                                    <div key={job.id} className="bg-zinc-900 text-white p-6 rounded-[2rem] shadow-2xl mb-4 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="font-display font-bold text-2xl">{job.productName}</h3>
                                                <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-mono-tech font-bold backdrop-blur-md border border-white/10">#{job.id.slice(0, 4)}</span>
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                                                        <Package size={14} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono-tech">Pickup From</p>
                                                        <p className="font-bold text-sm">{job.vendorName || "Vendor"}</p>
                                                    </div>
                                                </div>
                                                <div className="ml-4 border-l border-zinc-800 h-4"></div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-900">
                                                        <MapPin size={14} className="text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono-tech">Deliver To</p>
                                                        <p className="font-bold text-sm">{job.userEmail || "Customer"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => openNavigation(job.vendorAddress || "Lagos")}
                                                    className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-xl font-mono-tech font-bold text-xs uppercase tracking-widest backdrop-blur-md transition flex items-center justify-center gap-2"
                                                >
                                                    <Navigation size={14} /> Navigate
                                                </button>
                                                <button
                                                    onClick={() => completeJob(job.id)}
                                                    className="flex-1 bg-white text-zinc-900 hover:bg-zinc-200 py-4 rounded-xl font-mono-tech font-bold text-xs uppercase tracking-widest shadow-md transition flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle size={14} /> Delivered
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Available Jobs Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4 ml-1">
                                <h3 className="text-[10px] font-mono-tech font-bold text-zinc-400 uppercase tracking-widest">Nearby Requests</h3>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200 font-mono-tech">{availableDeliveries.length} Available</span>
                            </div>

                            {availableDeliveries.length === 0 ? (
                                <div className="text-center py-16 text-zinc-400 bg-white rounded-[2rem] border border-dashed border-zinc-200">
                                    <p className="font-display font-bold text-zinc-900 mb-1">No orders found</p>
                                    <p className="text-xs opacity-50 font-mono-tech uppercase tracking-widest">Scanning nearby zone...</p>
                                </div>
                            ) : (
                                availableDeliveries.map(job => (
                                    <div key={job.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-zinc-100 mb-4 hover:border-zinc-300 transition group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-display font-bold text-lg text-zinc-900">{job.productName}</h4>
                                                <p className="text-xs text-zinc-500">{job.vendorName}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-emerald-600 font-mono-tech">₦{(job.deliveryFee || 500).toLocaleString()}</span>
                                                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono-tech">Earnings</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-6 text-xs text-zinc-500 font-mono-tech">
                                            <span className="bg-zinc-100 px-2 py-1 rounded">{job.vendorDistance || "2.5km"}</span>
                                            <span>•</span>
                                            <span>{job.quantity || 1} Items</span>
                                        </div>

                                        <button
                                            onClick={() => acceptJob(job.id)}
                                            className="w-full py-4 bg-zinc-900 hover:bg-black text-white font-bold font-mono-tech text-xs uppercase tracking-widest rounded-xl transition shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                        >
                                            Accept Request <ChevronRight size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button onClick={onBack} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full text-[10px] font-mono-tech font-bold uppercase tracking-widest shadow-xl border border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200 transition">
                Exit System
            </button>
        </div>
    );
}