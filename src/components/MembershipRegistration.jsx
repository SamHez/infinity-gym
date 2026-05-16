import React, { useRef, useState } from 'react';
import { UserPlus, Check, Shield, Camera, Phone, User as UserIcon, Calendar, ChevronLeft } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import {
    calculateMembershipExpiryDate,
    customMonthOptions,
    defaultDurations,
    getCustomMonthsSummary,
    getDefaultMembershipFormData,
    getMembershipPrice,
    membershipCategories,
} from '../lib/membership';

export function MembershipRegistration({ onComplete, onCancel }) {
    const { showToast } = useToast();
    const [formData, setFormData] = useState(getDefaultMembershipFormData);
    const fileInputRef = useRef(null);

    const calculatedPrice = getMembershipPrice(formData);
    const calculatedExpiryDate = calculateMembershipExpiryDate(formData).toISOString().split('T')[0];

    const updateFormData = (updates) => {
        setFormData((current) => ({ ...current, ...updates }));
    };

    const handleCategoryChange = (category) => {
        updateFormData({
            category,
            duration: 'Monthly',
            customMonths: 2,
            dailyPassDays: 1,
        });
    };

    const handlePictureChange = (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            updateFormData({ picture: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        if (!formData.fullName || !formData.startDate) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        onComplete?.(formData, calculatedPrice);
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
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
                <div className="lg:col-span-2 space-y-8">
                    <Card title="Personnel Identity" subtitle="Section 01" className="p-8 md:p-10 space-y-8">
                        <div className="flex flex-col md:flex-row gap-8">
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
                                        onChange={(event) => updateFormData({ fullName: event.target.value })}
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
                                        onChange={(event) => updateFormData({ phone: event.target.value })}
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
                                    onChange={(event) => updateFormData({ startDate: event.target.value })}
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
                                    value={calculatedExpiryDate}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card title="Subscription Protocol" subtitle="Section 02" className="p-8 md:p-10 space-y-8">
                        <div className="space-y-6">
                            <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2">Asset Tier Selection</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {membershipCategories.map((category) => (
                                    <button
                                        key={category.name}
                                        onClick={() => handleCategoryChange(category.name)}
                                        className={cn(
                                            "p-6 rounded-[2.5rem] text-left border-4 transition-all group flex flex-col justify-center gap-2",
                                            formData.category === category.name
                                                ? "border-primary bg-primary/5 shadow-premium"
                                                : "border-text/5 bg-surface hover:border-text/10"
                                        )}
                                    >
                                        <p className={cn("text-lg font-bold leading-none mb-1", formData.category === category.name ? "text-primary" : "text-text")}>
                                            {category.name}
                                        </p>
                                        <p className="text-[9px] font-bold text-text/20 uppercase tracking-tighter leading-none">{category.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.category !== 'Daily Pass' ? (
                            <div className="space-y-6">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 block">Commitment Window</label>
                                <div className="flex flex-wrap gap-4">
                                    {defaultDurations.map((duration) => (
                                        <button
                                            key={duration.name}
                                            onClick={() => updateFormData({ duration: duration.name })}
                                            className={cn(
                                                "px-8 py-4 rounded-2xl text-[10px] font-bold transition-all uppercase tracking-[0.2em]",
                                                formData.duration === duration.name
                                                    ? "bg-primary text-white shadow-premium"
                                                    : "bg-surface border-2 border-text/5 text-text/30 hover:text-text/60"
                                            )}
                                        >
                                            {duration.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="rounded-[2rem] border border-text/5 bg-surface p-6 space-y-4">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text/30">Custom Commitment Window</p>
                                            <p className="text-sm font-bold text-text">Choose any advance period from 2 to 12 months.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => updateFormData({ duration: 'Custom Months' })}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                                                formData.duration === 'Custom Months'
                                                    ? "bg-primary text-white shadow-premium"
                                                    : "bg-card border border-text/10 text-text/40 hover:text-text"
                                            )}
                                        >
                                            Use Custom
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                        <select
                                            value={formData.customMonths}
                                            onChange={(event) => updateFormData({
                                                duration: 'Custom Months',
                                                customMonths: Number.parseInt(event.target.value, 10),
                                            })}
                                            className="glass-input w-full md:w-64 py-4 px-6 rounded-[1.5rem] font-bold text-sm uppercase"
                                        >
                                            {customMonthOptions.map((months) => (
                                                <option key={months} value={months}>
                                                    {months} Months
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/30">
                                            {formData.duration === 'Custom Months'
                                                ? `${getCustomMonthsSummary(formData.customMonths)} selected at monthly rate`
                                                : 'Preset package pricing remains available above'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 block">Daily Pass Window</label>
                                <div className="rounded-[2rem] border border-text/5 bg-surface p-6 space-y-4">
                                    <p className="text-sm font-bold text-text">Set how many days the daily pass should stay active.</p>
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={formData.dailyPassDays}
                                            onChange={(event) => updateFormData({
                                                dailyPassDays: Math.max(1, Number.parseInt(event.target.value || '1', 10)),
                                            })}
                                            className="glass-input w-full md:w-64 py-4 px-6 rounded-[1.5rem] font-bold text-sm uppercase"
                                        />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text/30">
                                            Payment and expiry update automatically for the selected number of days.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card title="Financial Settlement" subtitle="Verification" className="p-8 space-y-8 sticky top-32">
                        <div className="bg-surface border border-text/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-inner">
                            <div className="text-center">
                                <p className="text-text font-bold text-xl tracking-tighter mb-2 uppercase leading-none">{formData.fullName || 'NEW MEMBER'}</p>
                                <p className="text-primary text-[11px] font-bold uppercase tracking-[0.5em] mb-6">{formData.category}</p>

                                <div className="h-[2px] w-full bg-text/5 mb-6" />

                                <p className="text-text font-bold text-5xl tracking-tighter tabular-nums leading-none">{calculatedPrice.toLocaleString()}</p>
                                <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.5em] mt-3">TOTAL RWF</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 block">Settlement Logic</label>
                            {['Cash', 'Mobile Money'].map((paymentMethod) => (
                                <button
                                    key={paymentMethod}
                                    onClick={() => updateFormData({ paymentMethod })}
                                    className={cn(
                                        "w-full p-6 rounded-3xl flex items-center gap-6 border-4 transition-all group",
                                        formData.paymentMethod === paymentMethod
                                            ? "border-primary bg-primary/5 shadow-premium"
                                            : "border-text/5 bg-surface"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all",
                                        formData.paymentMethod === paymentMethod ? "border-primary" : "border-text/10"
                                    )}>
                                        {formData.paymentMethod === paymentMethod && <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(30,136,229,0.4)]" />}
                                    </div>
                                    <span className={cn("text-[11px] font-bold uppercase tracking-[0.2em]", formData.paymentMethod === paymentMethod ? "text-text" : "text-text/20")}>
                                        {paymentMethod}
                                    </span>
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
