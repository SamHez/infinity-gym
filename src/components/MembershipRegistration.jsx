import React, { useState } from 'react';
import { Card } from './Card';
import { UserPlus, ChevronRight, Check, Shield, Activity, Phone, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function MembershipRegistration({ onComplete }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        category: 'Normal Membership',
        duration: 'Monthly',
        paymentMethod: 'Cash',
    });

    const categories = [
        { name: 'Student', price: 20000, desc: 'ALU / CMU Restricted' },
        { name: 'Hotel Resident', price: 10000, desc: 'Infinity Guest Privileges' },
        { name: 'Normal Membership', price: 30000, desc: 'Comprehensive Gym Access' },
        { name: 'Group Membership', price: 20000, desc: 'Corporate / Linked Tier' },
    ];

    const durations = [
        { name: 'Weekly', discount: 0 },
        { name: 'Monthly', discount: 0 },
        { name: '3 Months', discount: 10 },
        { name: 'Annual', discount: 20 },
    ];

    const calculatePrice = () => {
        const base = categories.find(c => c.name === formData.category)?.price || 0;
        const duration = durations.find(d => d.name === formData.duration);

        let price = base;
        if (formData.duration === 'Weekly') price = Math.round(base / 3);
        else if (formData.duration === '3 Months') price = (base * 3) * (1 - duration.discount / 100);
        else if (formData.duration === 'Annual') price = (base * 12) * (1 - duration.discount / 100);

        return price.toLocaleString();
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            {/* Milestone Header */}
            <div className="flex items-center gap-4 md:gap-8 mb-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] md:rounded-[2.5rem] bg-accent/10 text-accent flex items-center justify-center font-bold text-3xl md:text-4xl shadow-sm animate-float ">
                    {step}
                </div>
                <div>
                    <h2 className="text-text font-bold text-3xl md:text-5xl tracking-tighter leading-none uppercase ">ENROLLMENT</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="h-1 w-12 md:w-20 bg-accent rounded-full" />
                        <p className="text-text/30 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em]">Phase {step} of 3</p>
                    </div>
                </div>
            </div>

            {step === 1 && (
                <Card title="Identity Verification" subtitle="Phase 01" className="p-6 md:p-14 space-y-8 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        <div className="space-y-3 md:space-y-4">
                            <label className="text-[10px] md:text-[11px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                <UserIcon size={14} className="text-accent" /> Full Legal Name
                            </label>
                            <input
                                type="text"
                                placeholder="Ex. Emmanuel Murenzi"
                                className="glass-input w-full py-5 md:py-7 pl-6 md:pl-8 rounded-2xl md:rounded-[2rem] font-bold text-lg md:text-xl "
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-3 md:space-y-4">
                            <label className="text-[10px] md:text-[11px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                <Phone size={14} className="text-accent" /> Identification Phone
                            </label>
                            <input
                                type="tel"
                                placeholder="+250 ..."
                                className="glass-input w-full py-5 md:py-7 pl-6 md:pl-8 rounded-2xl md:rounded-[2rem] font-bold text-lg md:text-xl  tabular-nums"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        disabled={!formData.fullName || !formData.phone}
                        onClick={nextStep}
                        className="w-full bg-primary text-white font-bold py-6 md:py-7 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center gap-4 mt-6 md:mt-8 active:scale-95 transition-all shadow-premium disabled:opacity-20 uppercase tracking-[0.3em] text-sm"
                    >
                        Tier Selection <ChevronRight size={24} strokeWidth={3} />
                    </button>
                </Card>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <Card className="p-8 md:p-14 space-y-10 md:space-y-12">
                        <div className="space-y-6 text-center md:text-left">
                            <label className="text-[10px] md:text-[11px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 ">Select Premium Asset Tier</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {categories.map(c => (
                                    <button
                                        key={c.name}
                                        onClick={() => setFormData({ ...formData, category: c.name })}
                                        className={cn(
                                            "p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] text-center border-4 transition-all group flex flex-col justify-center gap-2",
                                            formData.category === c.name
                                                ? "border-accent bg-accent/5 shadow-premium"
                                                : "border-text/5 bg-surface hover:border-text/10"
                                        )}
                                    >
                                        <p className={cn("text-base md:text-lg font-bold leading-none mb-1 ", formData.category === c.name ? "text-accent" : "text-text")}>{c.name}</p>
                                        <p className="text-[9px] font-bold text-text/20 uppercase tracking-tighter leading-none">{c.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] md:text-[11px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2  text-center md:text-left block">Commitment Window</label>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                                {durations.map(d => (
                                    <button
                                        key={d.name}
                                        onClick={() => setFormData({ ...formData, duration: d.name })}
                                        className={cn(
                                            "px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold transition-all uppercase tracking-[0.2em]",
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
                    </Card>

                    <div className="flex items-center gap-6">
                        <button onClick={prevStep} className="flex-1 py-7 bg-surface text-text/20 font-bold rounded-[2.5rem] text-xs uppercase tracking-[0.3em] hover:text-text/40 transition-all border border-text/5">Back</button>
                        <button
                            onClick={nextStep}
                            className="flex-[2] bg-primary text-white font-bold py-7 rounded-[2.5rem] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-premium uppercase tracking-[0.3em] text-sm"
                        >
                            Verify Ledger <ChevronRight size={24} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-8 animate-in zoom-in duration-500">
                    <Card title="Order Finalization" subtitle="Financial Settlement" className="p-10 md:p-14">
                        <div className="space-y-12">
                            <div className="bg-surface border border-text/5 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden group shadow-inner">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-[2s]">
                                    <Shield size={200} />
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 z-10 relative">
                                    <div className="text-center md:text-left">
                                        <p className="text-text font-bold text-2xl md:text-4xl tracking-tighter mb-4  uppercase leading-none">{formData.fullName}</p>
                                        <div className="flex items-center justify-center md:justify-start gap-4">
                                            <div className="px-4 md:px-5 py-1.5 md:py-2 bg-accent/10 border border-accent/20 rounded-xl md:rounded-2xl">
                                                <span className="text-accent text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] ">{formData.category} ACCESS</span>
                                            </div>
                                            <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-text/5 rounded-full" />
                                            <span className="text-text/20 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em]">{formData.duration}</span>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <p className="text-text font-bold text-4xl md:text-6xl tracking-tighter tabular-nums leading-none ">{calculatePrice()}</p>
                                        <p className="text-accent text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] mt-3 leading-none ">TOTAL RWF</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[11px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2  block text-center md:text-left">Settlement Logic</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['Cash', 'Mobile Money'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setFormData({ ...formData, paymentMethod: m })}
                                            className={cn(
                                                "p-8 rounded-[2.5rem] flex items-center gap-6 border-4 transition-all group",
                                                formData.paymentMethod === m
                                                    ? "border-accent bg-accent/5 shadow-premium"
                                                    : "border-text/5 bg-surface"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-7 h-7 rounded-full border-4 flex items-center justify-center transition-all",
                                                formData.paymentMethod === m ? "border-accent" : "border-text/10"
                                            )}>
                                                {formData.paymentMethod === m && <div className="w-3.5 h-3.5 bg-accent rounded-full shadow-[0_0_15px_rgba(201,166,70,0.6)]" />}
                                            </div>
                                            <span className={cn("text-sm font-bold uppercase tracking-[0.2em] ", formData.paymentMethod === m ? "text-text" : "text-text/20")}>{m}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <button
                        onClick={() => onComplete?.(formData)}
                        className="w-full bg-primary text-white font-bold py-8 rounded-[3.5rem] shadow-premium flex items-center justify-center gap-5 active:scale-95 transition-all uppercase tracking-[0.25em] text-sm group"
                    >
                        AUTHORIZE ENROLLMENT <Check size={32} strokeWidth={4} className="group-hover:rotate-12 transition-transform" />
                    </button>
                    <button onClick={prevStep} className="w-full py-4 text-text/10 font-bold text-[10px] uppercase tracking-[0.5em] hover:text-text/30 transition-colors ">Abort Operational Phase</button>
                </div>
            )}
        </div>
    );
}
