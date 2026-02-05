import React, { useState } from 'react';
import { Card } from './Card';
import { UserCheck, Search, CheckCircle2, QrCode, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

import { useMembers, useAttendance } from '../lib/data-hooks';

export function AttendanceTracking() {
    const [search, setSearch] = useState('');
    const { members, loading } = useMembers();

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.toLowerCase().includes(search.toLowerCase())
    );
    const { todayCount, checkIn, removeCheckIn, checkedInIds } = useAttendance();

    const handleCheckIn = async (id) => {
        await checkIn(id);
    };

    const handleRemove = async (id) => {
        await removeCheckIn(id);
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            {/* Real-time Counter Header */}
            <div className="flex justify-between items-center bg-card p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-text/5 shadow-premium relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000 hidden md:block">
                    <UserCheck size={200} />
                </div>
                <div className="z-10">
                    <h2 className="text-accent text-[9px] md:text-[11px] font-bold uppercase tracking-[0.5em] mb-2 leading-none ">Asset Presence</h2>
                    <p className="text-text text-2xl md:text-5xl font-bold tracking-tighter leading-none uppercase">CHECK-IN</p>
                </div>
                <div className="flex items-center gap-4 md:gap-10 z-10">
                    <div className="text-right">
                        <p className="text-accent font-bold text-3xl md:text-6xl tracking-tighter tabular-nums leading-none ">{todayCount}</p>
                        <p className="hidden md:block text-text/20 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Daily Operations Pool</p>
                        <p className="md:hidden text-text/20 text-[8px] font-bold uppercase tracking-[0.2em] mt-1">Today</p>
                    </div>
                    <div className="w-[1px] h-12 md:h-20 bg-text/5" />
                    <button className="p-4 md:p-6 bg-surface hover:bg-accent/10 hover:text-accent rounded-2xl md:rounded-[2rem] border border-text/5 transition-all active:scale-90 shadow-sm group/qr">
                        <QrCode size={24} className="md:w-8 md:h-8 group-hover/qr:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Strategic Command Input */}
            <Card className="p-2 md:p-3 border border-text/5 shadow-premium group">
                <div className="relative">
                    <Search className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
                    <input
                        type="text"
                        placeholder="IDENTIFY PERSONNEL..."
                        className="w-full bg-surface/50 border-none rounded-[1.5rem] md:rounded-[2.5rem] py-5 md:py-8 pl-16 md:pl-24 pr-6 md:pr-10 text-text font-bold text-sm md:text-2xl focus:ring-4 focus:ring-accent/10 placeholder:text-text/10 transition-all font-sans uppercase tracking-widest"
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
                    <div className="py-20 text-center text-text/10 font-bold uppercase tracking-[1em] animate-pulse">
                        Scanning Bio-Matrix...
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="py-20 text-center text-text/10 font-bold uppercase tracking-[0.5em]">
                        No Personnel Matching Search
                    </div>
                ) : filteredMembers.map(member => (
                    <Card key={member.id} className={cn(
                        "p-3 md:p-4 md:pr-8 flex items-center justify-between group transition-all duration-500",
                        member.status === 'Expired' ? "border-error/20 bg-error/[0.02]" : "hover:border-accent/30"
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
                                            member.status === 'Expired' ? "text-error" : "text-accent"
                                    )}>{member.status} {member.category} TIER</span>
                                    <div className="hidden md:block w-1.5 h-1.5 bg-text/5 rounded-full" />
                                    <span className="hidden md:block text-text/20 text-[10px] font-bold uppercase tracking-widest tabular-nums">AUTH #{member.id}X924</span>
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
        </div>
    );
}
