import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { UserPlus, Check, Shield, Camera, Phone, User as UserIcon, MapPin, CreditCard, Calendar, ChevronLeft, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export function MemberEdit({ member, onComplete, onCancel }) {
    const { showToast } = useToast();
    const isExpired = member.status === 'Expired';
    const [isRenewalMode, setIsRenewalMode] = useState(isExpired);
    const [formData, setFormData] = useState({
        fullName: member.full_name || '',
        phone: member.phone || '',
        startDate: new Date().toISOString().split('T')[0],
        category: member.category || 'Normal Membership',
        duration: member.duration || 'Monthly',
        paymentMethod: 'Cash',
        branchCode: member.branch_code || 'HQ',
        picture: member.picture_url || null,
        status: member.status || 'Active'
    });

    const fileInputRef = useRef(null);

    const categories = [
        { name: 'Normal Membership', price: 50000, desc: 'Comprehensive Gym Access' },
        { name: 'Group Membership', price: 300000, desc: 'Group of 10 Monthly Membership' },
        { name: 'Student (ALU)', price: 20000, desc: 'ALU Academic Discount' },
        { name: 'Student (CMU)', price: 30000, desc: 'CMU Academic Discount' },
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
        } else if (formData.category === 'Student (ALU)') {
            if (formData.duration === '3 Months') price = 60000;
            else if (formData.duration === '6 Months') price = 120000;
            else if (formData.duration === 'Annual') price = 240000;
        } else if (formData.category === 'Student (CMU)') {
            if (formData.duration === '3 Months') price = 90000;
            else if (formData.duration === '6 Months') price = 180000;
            else if (formData.duration === 'Annual') price = 360000;
        } else if (formData.category === 'Group Membership') {
            price = 300000; // Strictly monthly
        }

        return price;
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

        const price = isRenewalMode ? calculatePrice() : 0;
        onComplete?.(formData, price, isRenewalMode);
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            {/* Header with Back Button */}
            <div className="flex flex-col gap-6 mb-8">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] hover:translate-x-[-10px] transition-all self-start"
                >
                    <ChevronLeft size={16} strokeWidth={3} /> Abort Edits
                </button>
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-accent/10 text-accent flex items-center justify-center shadow-premium animate-float">
                        <UserIcon size={40} />
                    </div>
                    <div>
                        <h2 className="text-text font-bold text-4xl md:text-5xl tracking-tighter leading-none uppercase">
                            {isRenewalMode ? 'MEMBERSHIP RENEWAL' : 'MODIFY PROFILE'}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="h-1 w-20 bg-accent rounded-full" />
                            <p className="text-text/30 text-[11px] font-bold uppercase tracking-[0.5em]">{member.member_code}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Identity & Picture */}
                <div className="lg:col-span-2 space-y-8">
                    <Card title="Personnel Identity" subtitle="Update Mode" className="p-8 md:p-10 space-y-8">
                        {!isRenewalMode && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setIsRenewalMode(true)}
                                    className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest hover:underline"
                                >
                                    <RefreshCw size={12} /> Switch to Renewal Mode
                                </button>
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] self-start ml-2">Update Photo</label>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-40 h-40 rounded-[2.5rem] bg-surface border-4 border-dashed border-text/10 flex flex-col items-center justify-center cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all group overflow-hidden"
                                >
                                    {formData.picture ? (
                                        <img src={formData.picture} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Camera size={32} className="text-text/20 group-hover:text-accent transition-colors" />
                                            <span className="text-[9px] font-bold text-text/20 uppercase mt-2">Change</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePictureChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                        <UserIcon size={14} className="text-accent" /> Full Legal Name
                                    </label>
                                    <input
                                        type="text"
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
                                    <Calendar size={14} className="text-accent" /> {isRenewalMode ? 'Renewal Date' : 'Registration Date'} *
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

                    {isRenewalMode && (
                        <Card title="New Subscription Period" subtitle="Renewal Logic" className="p-8 md:p-10 space-y-8 animate-in slide-in-from-bottom duration-500">
                            <div className="space-y-6">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 ">Tier Selection</label>
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
                                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 block">New commitment window</label>
                                    <div className="flex flex-wrap gap-4">
                                        {durations
                                            .filter(d => {
                                                if (formData.category === 'Group Membership') return d.name === 'Monthly';
                                                if (formData.category === 'Student (ALU)' || formData.category === 'Student (CMU)' || formData.category === 'Normal Membership') return d.name !== 'Weekly';
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
                    )}
                </div>

                {/* Right Column: Checkout or Save */}
                <div className="space-y-8">
                    <Card title={isRenewalMode ? "Renewal Summary" : "System Update"} subtitle="Action" className="p-8 space-y-8 sticky top-32">
                        {isRenewalMode ? (
                            <div className="bg-surface border border-text/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-inner text-center">
                                <p className="text-text font-bold text-xl tracking-tighter mb-2 uppercase leading-none">{formData.fullName}</p>
                                <p className="text-primary text-[11px] font-bold uppercase tracking-[0.5em] mb-6">{formData.category}</p>
                                <div className="h-[2px] w-full bg-text/5 mb-6" />
                                <p className="text-text font-bold text-5xl tracking-tighter tabular-nums leading-none">{calculatePrice().toLocaleString()}</p>
                                <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.5em] mt-3">TOTAL RWF</p>
                            </div>
                        ) : (
                            <div className="bg-surface border border-text/5 p-8 rounded-[2.5rem] text-center opacity-50">
                                <p className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] mb-4">No financial transaction required for profile updates</p>
                                <UserIcon className="mx-auto text-text/10" size={48} />
                            </div>
                        )}

                        {isRenewalMode && (
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 block">Payment Logic</label>
                                {['Cash', 'Mobile Money'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setFormData({ ...formData, paymentMethod: m })}
                                        className={cn(
                                            "w-full p-6 rounded-3xl flex items-center gap-6 border-4 transition-all",
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
                        )}

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-primary text-white font-bold py-7 rounded-[2.5rem] shadow-premium flex items-center justify-center gap-4 active:scale-95 transition-all uppercase tracking-[0.25em] text-sm group"
                        >
                            {isRenewalMode ? 'COMMIT RENEWAL' : 'SAVE CHANGES'} <Check size={24} strokeWidth={4} />
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
