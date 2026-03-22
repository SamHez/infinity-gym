import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { CheckCircle2, Search, ShieldAlert, Ticket, X, Check, UserCheck, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

import { useMembers, useAttendance } from '../lib/data-hooks';

export function AttendanceTracking() {
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const { members, loading, refresh: refreshMembers } = useMembers();

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.toLowerCase().includes(search.toLowerCase())
    );
    const { todayCount, checkIn, removeCheckIn, checkedInIds, refresh: refreshAttendance, historicalData, fetchHistory } = useAttendance();

    useEffect(() => {
        fetchHistory('30d');
    }, [fetchHistory]);

    const handleCheckIn = async (id) => {
        await checkIn(id);
    };

    const handleRemove = async (id) => {
        await removeCheckIn(id);
    };

    const [showDailyPassModal, setShowDailyPassModal] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestPaymentMethod, setGuestPaymentMethod] = useState('Cash');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDailyPass = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const name = guestName.trim() || "Daily Pass Guest";

        try {
            // 1. Create a guest member record
            const year = new Date().getFullYear();
            const random = Math.floor(1000 + Math.random() * 9000);
            const memberCode = `GUEST-${year}-${random}`;

            const { data: member, error: memberError } = await supabase
                .from('members')
                .insert([{
                    member_code: memberCode,
                    full_name: name,
                    category: 'Daily Pass',
                    duration: 'Daily',
                    start_date: new Date().toISOString().split('T')[0],
                    expiry_date: new Date().toISOString().split('T')[0],
                    status: 'Active',
                    branch_code: 'HQ' // Default for guests
                }])
                .select()
                .single();

            if (memberError) throw memberError;

            // 2. Log the 3000 RWF payment
            const { error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    member_id: member.id,
                    amount: 3000,
                    payment_method: guestPaymentMethod
                }]);

            if (paymentError) throw paymentError;

            // 3. Check them in
            await checkIn(member.id);

            // 4. Refresh local state
            await refreshMembers();
            await refreshAttendance();

            setShowDailyPassModal(false);
            setGuestName('');
            showToast(`Access Authorized for ${name}. Payment Verified.`, 'success');
        } catch (error) {
            console.error("Daily Pass Error:", error);
            showToast("Security Protocol Failure: Failed to issue Daily Pass.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const yesterdayDateStr = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
    const yesterdayCount = historicalData?.daily?.find(d => d.date === yesterdayDateStr)?.count || 0;
    
    let liveGrowth = 0;
    if (yesterdayCount > 0) {
        liveGrowth = Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
    } else if (todayCount > 0) {
        liveGrowth = 100; // Infinity edge case placeholder
    }

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-accent text-[11px] font-bold uppercase tracking-[0.4em] mb-2 leading-none">Asset Presence</h2>
                    <p className="text-text text-3xl md:text-4xl font-bold tracking-tighter leading-none uppercase">ATTENDANCE</p>
                </div>

                <button
                    onClick={() => setShowDailyPassModal(true)}
                    className="flex items-center gap-3 bg-accent text-surface px-8 py-5 rounded-[2.5rem] font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
                >
                    <Ticket size={18} strokeWidth={3} />
                    Daily Pass
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="liquid-glass border-none shadow-xl shadow-accent/10">
                    <p className="text-accent/60 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Today's Checks</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-bold tracking-tighter text-text leading-none">{todayCount}</h3>
                        <span className={cn(
                            "text-[10px] font-bold mb-1 ml-2",
                            liveGrowth > 0 ? "text-success" : liveGrowth < 0 ? "text-error" : "text-text/40"
                        )}>
                            {liveGrowth > 0 ? '↑' : liveGrowth < 0 ? '↓' : ''} {Math.abs(liveGrowth)}%
                        </span>
                    </div>
                </Card>

                <Card>
                    <p className="text-text/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Peak Activity Day</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold tracking-tighter text-text leading-none">{historicalData?.peakDay || '-'}</h3>
                    </div>
                </Card>

                <Card>
                    <p className="text-text/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Busiest Window</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold tracking-tighter text-text leading-none">{historicalData?.peakHour || '-'}</h3>
                    </div>
                </Card>

                <Card>
                    <p className="text-text/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Daily Baseline</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold tracking-tighter text-text leading-none">{historicalData?.avgDaily || 0}</h3>
                        <span className="text-[11px] font-bold text-text/40 mb-1">/ day</span>
                    </div>
                </Card>
            </div>

            {/* Strategic Command Input */}
            <Card className="p-2 border border-text/5 shadow-premium group">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors w-4 h-4" strokeWidth={2.5} />
                    <input
                        type="text"
                        placeholder="IDENTIFY PERSONNEL..."
                        className="w-full bg-surface/50 border-none rounded-[1.5rem] py-3 pl-14 pr-6 text-text font-bold text-sm focus:ring-4 focus:ring-accent/10 placeholder:text-text/10 transition-all font-sans uppercase tracking-widest"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
            </Card>

            {/* Active Selection Matrix */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 ml-4">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <p className="text-text/20 text-[11px] font-bold uppercase tracking-[0.5em] ">Tactical Suggestions</p>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center text-text/20">
                        <Loader2 size={28} className="animate-spin text-accent" />
                        <div className="font-bold uppercase tracking-[0.5em]">
                            Scanning Bio-Matrix...
                        </div>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="py-20 text-center text-text/10 font-bold uppercase tracking-[0.5em]">
                        No Personnel Matching Search
                    </div>
                ) : filteredMembers.map(member => (
                    <Card key={member.id} className={cn(
                        "p-3 md:p-4 md:pr-8 flex items-center justify-between group transition-all duration-500",
                        member.status === 'Expired' ? "border-error/20 bg-error/[0.02]" : "hover:border-primary/30"
                    )}>
                        <div className="flex items-center gap-4 md:gap-10">
                            <div className={cn(
                                "w-14 h-14 md:w-20 md:h-20 rounded-2.5xl md:rounded-[2.5rem] flex items-center justify-center transition-all duration-1000",
                                checkedInIds.includes(member.id)
                                    ? "bg-success text-white shadow-premium scale-105 md:scale-110"
                                    : "bg-surface text-text/10 group-hover:text-text/30"
                            )}>
                                {checkedInIds.includes(member.id) ?
                                    <CheckCircle2 size={24} className="md:w-10 md:h-10" strokeWidth={2.5} /> :
                                    <UserCheck size={24} className="md:w-10 md:h-10" strokeWidth={2.5} />
                                }
                            </div>
                            <div>
                                <div className="flex items-center gap-3 md:gap-4 mb-1">
                                    <p className="text-text font-bold text-lg md:text-3xl tracking-tighter leading-none">{member.full_name}</p>
                                    {member.status === 'Expired' && <ShieldAlert size={16} className="md:w-5 md:h-5 text-error" />}
                                </div>
                                <div className="flex items-center gap-2 md:gap-4">
                                    <span className={cn(
                                        "text-[8px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] ",
                                        member.status === 'Active' ? "text-success" :
                                            member.status === 'Expired' ? "text-error" : "text-primary"
                                    )}>{member.status} {member.category} TIER</span>
                                    <div className="hidden md:block w-1.5 h-1.5 bg-text/5 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={member.status === 'Expired'}
                            onClick={() => checkedInIds.includes(member.id) ? handleRemove(member.id) : handleCheckIn(member.id)}
                            className={cn(
                                "p-4 md:px-10 md:py-5 rounded-2xl md:rounded-[2rem] font-bold text-[11px] uppercase tracking-[0.2em] transition-all relative overflow-hidden",
                                checkedInIds.includes(member.id)
                                    ? "bg-success/5 text-success border border-success/20 hover:bg-error/10 hover:text-error hover:border-error/30"
                                    : (member.status === 'Expired'
                                        ? "bg-error/5 text-error opacity-40 cursor-not-allowed"
                                        : "bg-primary text-white shadow-premium hover:scale-105 active:scale-95 hover:bg-accent hover:text-surface")
                            )}
                        >
                            <span className="hidden md:inline">
                                {checkedInIds.includes(member.id) ? 'Identity Verified (Undo)' : (member.status === 'Expired' ? 'Terminated Access' : 'Authorize Presence')}
                            </span>
                            <span className="md:hidden">
                                {checkedInIds.includes(member.id) ? <CheckCircle2 size={18} strokeWidth={3} /> : <UserCheck size={18} strokeWidth={3} />}
                            </span>
                        </button>
                    </Card>
                ))}
            </div>

            {/* Daily Pass Modal */}
            {showDailyPassModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowDailyPassModal(false)} />
                    <Card className="relative w-full max-w-xl p-10 space-y-10 shadow-3xl animate-in zoom-in-95 duration-200 border-none bg-card" title="GUEST AUTHORIZATION" subtitle="Daily Pass Entry">
                        <form onSubmit={handleDailyPass} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2">Guest Identity (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-text/[0.03] border border-text/5 rounded-3xl py-6 px-8 text-xl font-bold tracking-tighter focus:outline-none focus:border-accent/40 focus:bg-white transition-all shadow-inner"
                                    placeholder="ENTER NAME..."
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                />
                            </div>

                            <div className="bg-accent/5 border border-accent/20 p-8 rounded-[2.5rem] flex items-center justify-between">
                                <div>
                                    <p className="text-accent text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Pass Value</p>
                                    <h4 className="text-3xl font-black text-text tracking-tighter">3,000 <span className="text-xs text-text/20 uppercase tracking-[0.2em]">RWF</span></h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Duration</p>
                                    <p className="text-text font-bold uppercase tracking-widest text-xs">Single Entry</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 block">Settlement Logic</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Cash', 'Mobile Money'].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setGuestPaymentMethod(m)}
                                            className={cn(
                                                "p-6 rounded-3xl flex items-center justify-center gap-3 border-4 transition-all",
                                                guestPaymentMethod === m ? "border-accent bg-accent/5" : "border-text/5 bg-surface opacity-40"
                                            )}
                                        >
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{m}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDailyPassModal(false)}
                                    className="flex-1 py-6 bg-text/5 text-text rounded-3xl font-bold uppercase tracking-widest text-[10px] hover:bg-text/10 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] py-6 bg-accent text-surface rounded-3xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmitting ? "PROCESSING..." : (
                                        <>CONFIRM ENTRY <Check size={18} strokeWidth={4} /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
