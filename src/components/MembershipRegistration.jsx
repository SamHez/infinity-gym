import React, { useState, useRef } from 'react';
import { Card } from './Card';
import { UserPlus, Check, Shield, Camera, Phone, User as UserIcon, MapPin, CreditCard, Calendar, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export function MembershipRegistration({ onComplete, onCancel }) {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        startDate: new Date().toISOString().split('T')[0],
        category: 'Normal Membership',
        duration: 'Monthly',
        paymentMethod: 'Cash',
        branchCode: 'HQ',
        picture: null,
    });

    const fileInputRef = useRef(null);

    const categories = [
        { name: 'Normal Membership', price: 50000, desc: 'Comprehensive Gym Access' },
        { name: 'Group Membership', price: 300000, desc: 'Group of 10 Monthly Membership' },
        { name: 'Student (alu/cmu etc)', price: 20000, desc: 'Academic Discount Tier' },
        { name: 'Daily Pass', price: 4000, desc: 'Single Entry' },
    ];

    const durations = [
        { name: 'Weekly', discount: 0 },
        { name: 'Monthly', discount: 0 },
        { name: '3 Months', discount: 0 },
        { name: '6 Months', discount: 0 },
        { name: 'Annual', discount: 0 },
    ];

    const branches = [
        { code: 'HQ', name: 'Main Branch' },
        { code: 'KN', name: 'Kigali North' },
        { code: 'KS', name: 'Kigali South' },
    ];

    const calculatePrice = () => {
        const base = categories.find(c => c.name === formData.category)?.price || 0;
        
        let price = base;
        if (formData.category === 'Normal Membership') {
            if (formData.duration === '3 Months') price = 120000;
            else if (formData.duration === '6 Months') price = 220000;
            else if (formData.duration === 'Annual') price = 300000;
        } else if (formData.category === 'Student (alu/cmu etc)') {
            if (formData.duration === '3 Months') price = 60000;
            else if (formData.duration === '6 Months') price = 120000;
            else if (formData.duration === 'Annual') price = 240000;
        } else if (formData.category === 'Group Membership') {
            price = 300000; // Strictly monthly
        }

        return price.toLocaleString();
    };

    const calculateExpiryDate = () => {
        let expiry = new Date(formData.startDate || new Date());
        if (formData.category === 'Daily Pass') {
            expiry.setDate(expiry.getDate() + 1);
        } else {
            if (formData.duration === 'Weekly') expiry.setDate(expiry.getDate() + 7);
            else if (formData.duration === 'Monthly') expiry.setMonth(expiry.getMonth() + 1);
            else if (formData.duration === '3 Months') expiry.setMonth(expiry.getMonth() + 3);
            else if (formData.duration === '6 Months') expiry.setMonth(expiry.getMonth() + 6);
            else if (formData.duration === 'Annual') expiry.setFullYear(expiry.getFullYear() + 1);
        }
        return expiry.toISOString().split('T')[0];
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, picture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!formData.fullName || !formData.startDate) {
            showToast("Please fill in all required fields.", "error");
            return;
        }

        const priceString = calculatePrice().replace(/,/g, '');
        const price = parseInt(priceString);

        onComplete?.(formData, price);
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            {/* Header with Back Button */}
            <div className="flex flex-col gap-6 mb-8">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] hover:translate-x-[-10px] transition-all self-start"
                >
                    <ChevronLeft size={16} strokeWidth={3} /> Return to Directory
                </button>
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-accent/10 text-accent flex items-center justify-center shadow-premium animate-float">
                        <UserPlus size={40} />
                    </div>
                    <div>
                        <h2 className="text-text font-bold text-4xl md:text-5xl tracking-tighter leading-none uppercase">NEW ENROLLMENT</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-1 w-20 bg-accent rounded-full" />
                            <p className="text-text/30 text-[11px] font-bold uppercase tracking-[0.5em]">Unified Registration Process</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Identity & Picture */}
                <div className="lg:col-span-2 space-y-8">
                    <Card title="Personnel Identity" subtitle="Section 01" className="p-8 md:p-10 space-y-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Picture Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] self-start ml-2">Member Photo</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-40 h-40 rounded-[2.5rem] bg-surface border-4 border-dashed border-text/10 flex flex-col items-center justify-center cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all group overflow-hidden"
                                >
                                    {formData.picture ? (
                                        <img src={formData.picture} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Camera size={32} className="text-text/20 group-hover:text-accent transition-colors" />
                                            <span className="text-[9px] font-bold text-text/20 uppercase mt-2">Capture</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePictureChange}
                                    accept="image/*"
                                    capture="user"
                                    className="hidden"
                                />
                            </div>

                            {/* Info Fields */}
                            <div className="flex-1 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                        <UserIcon size={14} className="text-accent" /> Full Legal Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex. Emmanuel Murenzi"
                                        className="glass-input w-full py-5 px-8 rounded-[2rem] font-bold text-lg"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                        <Phone size={14} className="text-accent" /> Identification Phone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+250 ..."
                                        className="glass-input w-full py-5 px-8 rounded-[2rem] font-bold text-lg tabular-nums"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                    <Calendar size={14} className="text-accent" /> Registration Date *
                                </label>
                                <input
                                    type="date"
                                    className="glass-input w-full py-5 px-8 rounded-[2rem] font-bold text-lg uppercase"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                    <Shield size={14} className="text-primary" /> Auto-Expiry Date
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    className="glass-input w-full py-5 px-8 rounded-[2rem] font-bold text-lg uppercase text-text/50 bg-black/5"
                                    value={calculateExpiryDate()}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Tier Selection */}
                    <Card title="Subscription Protocol" subtitle="Section 02" className="p-8 md:p-10 space-y-8">
                        <div className="space-y-6">
                            <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 ">Asset Tier Selection</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {categories.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => {
                                            const nextData = { ...formData, category: c.name };
                                            if (c.name === 'Group Membership') nextData.duration = 'Monthly';
                                            setFormData(nextData);
                                        }}
                                        className={cn(
                                            "p-6 rounded-[2.5rem] text-left border-4 transition-all group flex flex-col justify-center gap-2",
                                            formData.category === c.name
                                                ? "border-primary bg-primary/5 shadow-premium"
                                                : "border-text/5 bg-surface hover:border-text/10"
                                        )}
                                    >
                                        <p className={cn("text-lg font-bold leading-none mb-1", formData.category === c.name ? "text-primary" : "text-text")}>{c.name}</p>
                                        <p className="text-[9px] font-bold text-text/20 uppercase tracking-tighter leading-none">{c.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.category !== 'Daily Pass' && (
                            <div className="space-y-6">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 block">Commitment Window</label>
                                <div className="flex flex-wrap gap-4">
                                    {durations
                                        .filter(d => {
                                            if (formData.category === 'Group Membership') return d.name === 'Monthly';
                                            if (formData.category === 'Student (alu/cmu etc)' || formData.category === 'Normal Membership') return d.name !== 'Weekly';
                                            return true;
                                        })
                                        .map(d => (
                                            <button
                                                key={d.name}
                                                onClick={() => setFormData({ ...formData, duration: d.name })}
                                                className={cn(
                                                    "px-8 py-4 rounded-2xl text-[10px] font-bold transition-all uppercase tracking-[0.2em]",
                                                    formData.duration === d.name
                                                        ? "bg-primary text-white shadow-premium"
                                                        : "bg-surface border-2 border-text/5 text-text/30 hover:text-text/60"
                                                )}
                                            >
                                                {d.name} {d.discount > 0 && <span className="ml-2 text-[9px] text-accent">-{d.discount}%</span>}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column: Checkout & Finalization */}
                <div className="space-y-8">
                    <Card title="Financial Settlement" subtitle="Verification" className="p-8 space-y-8 sticky top-32">
                        <div className="bg-surface border border-text/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-inner">
                            <div className="text-center">
                                <p className="text-text font-bold text-xl tracking-tighter mb-2 uppercase leading-none">{formData.fullName || 'NEW MEMBER'}</p>
                                <p className="text-primary text-[11px] font-bold uppercase tracking-[0.5em] mb-6">{formData.category}</p>

                                <div className="h-[2px] w-full bg-text/5 mb-6" />

                                <p className="text-text font-bold text-5xl tracking-tighter tabular-nums leading-none">{calculatePrice()}</p>
                                <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.5em] mt-3">TOTAL RWF</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 block">Settlement Logic</label>
                            {['Cash', 'Mobile Money'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setFormData({ ...formData, paymentMethod: m })}
                                    className={cn(
                                        "w-full p-6 rounded-3xl flex items-center gap-6 border-4 transition-all group",
                                        formData.paymentMethod === m
                                            ? "border-primary bg-primary/5 shadow-premium"
                                            : "border-text/5 bg-surface"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all",
                                        formData.paymentMethod === m ? "border-primary" : "border-text/10"
                                    )}>
                                        {formData.paymentMethod === m && <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(30,136,229,0.4)]" />}
                                    </div>
                                    <span className={cn("text-[11px] font-bold uppercase tracking-[0.2em]", formData.paymentMethod === m ? "text-text" : "text-text/20")}>{m}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!formData.fullName || !formData.startDate}
                            className="w-full bg-primary text-white font-bold py-7 rounded-[2.5rem] shadow-premium flex items-center justify-center gap-4 active:scale-95 transition-all uppercase tracking-[0.25em] text-sm group disabled:opacity-20"
                        >
                            AUTHORIZE <Check size={24} strokeWidth={4} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
