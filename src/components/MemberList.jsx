import React, { useState } from 'react';
import { Card } from './Card';
import { Search, Filter, MoreHorizontal, User, ShieldCheck, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

import { useMembers } from '../lib/data-hooks';

export function MemberList({ onAddMember }) {
    const [search, setSearch] = useState('');
    const { members, loading } = useMembers();

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10">
            {/* Directory Header */}
            <div className="flex justify-between items-center bg-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-text/5 shadow-premium relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
                <div>
                    <h2 className="text-accent text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-1 leading-none ">Asset Database</h2>
                    <p className="text-text text-2xl md:text-5xl font-bold tracking-tighter leading-none uppercase">DIRECTORY</p>
                </div>

                <button
                    onClick={onAddMember}
                    className="flex items-center gap-0 md:gap-4 p-4 md:px-8 md:py-5 bg-primary text-white rounded-2xl md:rounded-3xl shadow-premium hover:scale-105 active:scale-95 transition-all font-bold text-xs uppercase tracking-widest z-10"
                >
                    <Plus size={20} strokeWidth={3} className="md:mr-0" />
                    <span className="hidden md:inline">New Enrollment</span>
                </button>
            </div>

            {/* Tactical Search Interface */}
            <Card className="p-2 border border-text/5 shadow-premium group">
                <div className="relative">
                    <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                    <input
                        type="text"
                        placeholder="SEARCH MEMBERS..."
                        className="w-full bg-surface/50 border-none rounded-[1.5rem] md:rounded-[2rem] py-5 md:py-7 pl-14 md:pl-20 pr-6 md:pr-8 text-text font-bold text-sm md:text-xl focus:ring-4 focus:ring-accent/10 placeholder:text-text/10 transition-all font-sans uppercase tracking-widest"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </Card>

            {/* Grid-based Member Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-2 py-20 text-center text-text/10 font-bold uppercase tracking-[1em] animate-pulse">
                        Synchronizing Database...
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="col-span-2 py-20 text-center text-text/10 font-bold uppercase tracking-[0.5em]">
                        No Assets Identified in Registry
                    </div>
                ) : filteredMembers.map(member => (
                    <Card key={member.id} className="p-4 pr-10 flex items-center justify-between group hover:border-accent/30 transition-all relative overflow-hidden">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-surface flex items-center justify-center text-text/10 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-700">
                                <User size={32} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <p className="text-text font-bold text-xl md:text-2xl tracking-tighter leading-none">{member.full_name}</p>
                                    {member.status === 'Active' && <ShieldCheck size={18} className="text-success" />}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-text/20 uppercase tracking-[0.15em]">{member.category} ACCESS</span>
                                    <div className="w-1.5 h-1.5 bg-text/5 rounded-full" />
                                    <span className={cn(
                                        "text-[10px] font-bold tracking-tight px-3 py-1 rounded-xl shadow-sm",
                                        member.status === 'Active' ? "text-success bg-success/10 border border-success/20" :
                                            member.status === 'Expiring Soon' ? "text-accent bg-accent/10 border border-accent/20" : "text-error bg-error/10 border border-error/20"
                                    )}>
                                        {member.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-[9px] font-bold text-text/10 uppercase tracking-tighter mt-1 ">Renewal Pipeline: {member.expiry_date}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-4 text-text/10 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all">
                                <MoreHorizontal size={28} />
                            </button>
                        </div>

                        {/* Status edge indicator */}
                        <div className={cn(
                            "absolute top-0 right-0 w-1.5 h-full opacity-30",
                            member.status === 'Active' ? "bg-success" :
                                member.status === 'Expiring Soon' ? "bg-accent" : "bg-error"
                        )} />
                    </Card>
                ))}
            </div>

            {/* Audit Summary Footer */}
            <div className="pt-10 flex flex-col items-center gap-4">
                <div className="h-[2px] w-32 bg-text/[0.03] rounded-full" />
                <p className="text-text/20 font-bold text-xs uppercase tracking-[0.5em] ">
                    Viewing {filteredMembers.length.toLocaleString()} Verified Personnel
                </p>
            </div>
        </div>
    );
}
