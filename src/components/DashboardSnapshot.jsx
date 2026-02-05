import React from 'react';
import { StatCard, Card } from './Card';
import { Users, TrendingUp, UserPlus, RefreshCw, Smartphone, Wallet, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

import { useAttendance, useMembers, useFinance } from '../lib/data-hooks';

export function DashboardSnapshot() {
    const { todayCount } = useAttendance();
    const { members } = useMembers();
    const { stats: financeStats } = useFinance();

    const stats = [
        { label: "Active Traffic", value: todayCount.toString(), trend: 0, icon: Users },
        { label: "Daily Revenue", value: `${(financeStats.revenue / 1000).toFixed(1)}k`, trend: 0, icon: TrendingUp, colorClass: "text-accent" },
        { label: "Total Members", value: members.length.toString(), trend: 0, icon: UserPlus },
        { label: "Renewals", value: "2", trend: 0, icon: RefreshCw },
    ];

    return (
        <div className="space-y-10">
            {/* Intelligence Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-1 leading-none">Operational Intelligence</h2>
                    <p className="text-text text-2xl md:text-3xl font-bold tracking-tighter leading-none uppercase">Infinity Hotel Gym</p>
                </div>
                <div className="flex items-center gap-4 bg-card px-6 py-4 rounded-3xl border border-text/5 shadow-premium">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse shadow-[0_0_15px_rgba(46,204,113,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text">Syncing Live</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Advanced Performance Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card subtitle="Revenue Velocity" title="History" className="lg:col-span-2">
                    <div className="h-48 flex items-end justify-between gap-3 pt-8 px-4">
                        {(() => {
                            const data = financeStats.monthlyData || new Array(10).fill({ month: '-', revenue: 0 });
                            const maxRev = Math.max(...data.map(d => d.revenue), 10); // Min 10k scale
                            return data.map((item, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end">
                                    <div
                                        className={cn(
                                            "w-full rounded-2xl transition-all duration-[1500ms] relative group min-h-[2px]",
                                            i === data.length - 1 ? "bg-accent shadow-gold" : "bg-text/10 dark:bg-white/10"
                                        )}
                                        style={{ height: `${(item.revenue / maxRev) * 100}%` }}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-text text-surface dark:bg-accent dark:text-surface text-[9px] font-bold px-2 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-premium whitespace-nowrap z-20">
                                            {Math.round(item.revenue)}k
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-text/30 uppercase">
                                        {item.month}
                                    </span>
                                </div>
                            ));
                        })()}
                    </div>
                </Card>

                <Card subtitle="Access Control" title="Gate Status" className="flex flex-col justify-center items-center p-12 space-y-8">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-text/[0.03]" />
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="110" className="text-accent" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold  tracking-tighter leading-none">75%</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-text/20 mt-1">Capacity</span>
                        </div>
                    </div>
                    <p className="text-center text-text/40 text-xs font-medium leading-relaxed">
                        Membership utilization is optimized. Peak performance predicted for 18:00 CAT.
                    </p>
                </Card>
            </div>

            {/* Liquidity Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="flex items-center gap-8 p-10 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-150 transition-transform duration-1000">
                        <Smartphone size={200} />
                    </div>
                    <div className="w-20 h-20 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:rotate-12 transition-transform shadow-sm">
                        <Smartphone size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-text font-bold text-xl mb-1 tracking-tight">Mobile Settlements</h4>
                        <p className="text-text font-bold text-4xl tracking-tighter ">{(financeStats.mobileRevenue || 0).toLocaleString()} <span className="text-accent text-xs not- tracking-widest ml-1">RWF</span></p>
                    </div>
                </Card>
                <Card className="flex items-center gap-8 p-10 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-150 transition-transform duration-1000">
                        <Wallet size={200} />
                    </div>
                    <div className="w-20 h-20 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform shadow-sm">
                        <Wallet size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h4 className="text-text font-bold text-xl mb-1 tracking-tight">Front Office Cash</h4>
                        <p className="text-text font-bold text-4xl tracking-tighter ">{(financeStats.cashRevenue || 0).toLocaleString()} <span className="text-primary text-xs not- tracking-widest ml-1">RWF</span></p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
