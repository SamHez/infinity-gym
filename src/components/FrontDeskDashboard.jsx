import React, { useState } from 'react';
import { Card, StatCard } from './Card';
import { Users, UserPlus, Calendar, Activity, CheckCircle2, TrendingUp, Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

import { useAttendance, useMembers, useFinance } from '../lib/data-hooks';

export function FrontDeskDashboard({ onNavigate }) {
    const { todayCount, checkIn, removeCheckIn, checkedInIds, loading: attendanceLoading } = useAttendance();
    const { members, loading: membersLoading } = useMembers();
    const { stats: financeStats, loading: financeLoading } = useFinance();

    const isSyncing = attendanceLoading || membersLoading || financeLoading;
    const [search, setSearch] = useState('');

    const expiredCount = members.filter(m => m.status === 'Expired').length;
    const expiringSoonCount = members.filter(m => m.status === 'Expiring Soon').length;

    const filteredMembers = search.trim() === ''
        ? []
        : members.filter(m =>
            m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            m.phone?.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 5);

    const handleCheckIn = async (memberId) => {
        const success = await checkIn(memberId);
        if (success) {
            setSearch('');
        }
    };

    const handleRemove = async (memberId) => {
        const success = await removeCheckIn(memberId);
        if (success) {
            setSearch('');
        }
    };

    const quickStats = [
        { label: "Today's Attendance", value: todayCount.toString(), icon: Users, trend: 0 },
        { label: "Total Members", value: members.length.toString(), icon: UserPlus, trend: 0 },
        { label: "Daily Revenue", value: `RWF ${financeStats.revenue.toLocaleString()}`, icon: Activity, trend: 0 },
    ];

    const recentActivity = members.slice(0, 4).map((m, i) => ({
        id: m.id,
        name: m.full_name,
        action: i % 2 === 0 ? "Check-in" : "Renewal",
        time: "Recently",
        type: i % 2 === 0 ? "attendance" : "payment"
    }));

    return (
        <div className="space-y-10">
            {/* Action Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-1 leading-none">Front Desk Operations</h2>
                    <p className="text-text text-2xl md:text-3xl font-bold tracking-tighter leading-none uppercase">INFINITY HOTEL GYM</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => onNavigate('attendance')}
                        className="flex items-center gap-3 bg-primary text-surface px-6 py-4 rounded-3xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-premium"
                    >
                        <Calendar size={18} strokeWidth={2.5} />
                        Quick Check-in
                    </button>
                    <button
                        onClick={() => onNavigate('members', 'register')}
                        className="flex items-center gap-3 bg-accent text-surface px-6 py-4 rounded-3xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-gold"
                    >
                        <Plus size={18} strokeWidth={3} />
                        New Member
                    </button>
                </div>
            </div>

            {/* Real-time Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickStats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Activity Stream */}
                <Card subtitle="Instant Timeline" title="Recent Activity">
                    <div className="mt-6 space-y-4">
                        {isSyncing ? (
                            <div className="py-10 text-center text-text/10 font-bold uppercase tracking-[0.5em] animate-pulse">
                                Syncing Timeline...
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="py-10 text-center text-text/10 font-bold uppercase tracking-[0.2em]">
                                No Recent Tactical Activity
                            </div>
                        ) : recentActivity.map((item) => (
                            <div key={item.id} className="group flex items-center justify-between p-4 bg-text/[0.02] border border-text/5 rounded-3xl hover:bg-surface transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                                        item.type === 'attendance' ? "bg-primary/10 text-primary" :
                                            item.type === 'payment' ? "bg-accent/10 text-accent" : "bg-success/10 text-success"
                                    )}>
                                        {item.type === 'attendance' ? <Activity size={20} /> : <TrendingUp size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-text font-bold text-sm uppercase">{item.name}</p>
                                        <p className="text-text/40 text-[10px] font-bold uppercase tracking-widest">{item.action}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-text/60 font-bold text-xs">{item.time}</p>
                                    <div className="flex gap-1 justify-end mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-text/20 hover:text-accent transition-colors">
                            View Detailed Logs
                        </button>
                    </div>
                </Card>

                {/* Quick Search & Filter */}
                <Card subtitle="Member Registry" title="Quick Search">
                    <div className="mt-6 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="FIND BY NAME OR PHONE..."
                                className="w-full bg-text/[0.03] border border-text/5 rounded-[2rem] py-6 pl-16 pr-8 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-accent/30 focus:bg-white transition-all shadow-inner"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Search Results List */}
                        {search.trim() !== '' && (
                            <div className="bg-surface rounded-3xl border border-text/5 divide-y divide-text/5 overflow-hidden shadow-premium animate-in slide-in-from-top-4 duration-300">
                                {filteredMembers.length === 0 ? (
                                    <div className="p-6 text-center text-text/20 text-[10px] font-bold uppercase tracking-widest">
                                        No assets identified
                                    </div>
                                ) : (
                                    filteredMembers.map(member => (
                                        <div
                                            key={member.id}
                                            className="p-4 hover:bg-text/[0.02] group flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-surface border border-text/5 flex items-center justify-center text-text/20 group-hover:text-primary transition-colors">
                                                    <Users size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-text font-bold text-xs uppercase">{member.full_name}</p>
                                                    <p className="text-text/30 text-[9px] font-bold uppercase tracking-widest">{member.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-tighter",
                                                    member.status === 'Active' ? "bg-success/10 text-success border border-success/20" :
                                                        member.status === 'Expiring Soon' ? "bg-accent/10 text-accent border border-accent/20" :
                                                            "bg-error/10 text-error border border-error/20"
                                                )}>
                                                    {member.status}
                                                </div>
                                                {member.status !== 'Expired' && (
                                                    <button
                                                        onClick={() => checkedInIds.includes(member.id) ? handleRemove(member.id) : handleCheckIn(member.id)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors shadow-sm",
                                                            checkedInIds.includes(member.id)
                                                                ? "bg-success text-white hover:bg-error"
                                                                : "bg-primary text-white hover:bg-accent"
                                                        )}
                                                        title={checkedInIds.includes(member.id) ? "Undo Check-in" : "Quick Check-in"}
                                                    >
                                                        <CheckCircle2 size={12} strokeWidth={3} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-surface rounded-3xl border border-text/5 text-center group hover:border-accent/20 transition-all cursor-pointer">
                                <span className="block text-text/20 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Expired</span>
                                <span className="text-2xl font-bold ">{expiredCount}</span>
                            </div>
                            <div className="p-6 bg-surface rounded-3xl border border-text/5 text-center group hover:border-accent/20 transition-all cursor-pointer">
                                <span className="block text-text/20 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Expiring Soon</span>
                                <span className="text-2xl font-bold  text-accent">{expiringSoonCount}</span>
                            </div>
                        </div>

                        <div className="hidden bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 flex items-center justify-between">
                            <div>
                                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">Gate System Status</p>
                                <p className="text-text font-bold text-lg  uppercase">Online & Operational</p>
                            </div>
                            <div className="w-14 h-14 rounded-2.5xl bg-primary text-surface flex items-center justify-center shadow-lg">
                                <CheckCircle2 size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Action Prompts */}
            <div className="bg-accent rounded-[3rem] p-12 text-surface overflow-hidden relative shadow-gold">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-black/5 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-4xl font-bold  tracking-tighter uppercase mb-2">Shift Performance</h3>
                        <p className="text-surface/70 font-bold uppercase tracking-widest text-[10px]">Your activity today has been exceptional. Keep the momentum!</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-6xl font-bold  tracking-tighter leading-none mb-2">98%</p>
                        <p className="text-surface/50 text-[9px] font-bold uppercase tracking-widest">Efficiency Rating</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
