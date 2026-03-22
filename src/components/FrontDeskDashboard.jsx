import React, { useState, useEffect, useMemo } from 'react';
import { Card, StatCard } from './Card';
import { Users, UserPlus, Calendar, Activity, CheckCircle2, TrendingUp, Search, Plus, Receipt, Smartphone, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAttendance, useMembers, useFinance, useMemberDistribution } from '../lib/data-hooks';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { ReportDropdown } from './ReportDropdown';

export function FrontDeskDashboard({ onNavigate }) {
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [actionsOpen, setActionsOpen] = useState(false);
    const searchRef = React.useRef(null);
    const actionsRef = React.useRef(null);
    
    useEffect(() => {
        const handler = (e) => {
            if (actionsRef.current && !actionsRef.current.contains(e.target)) setActionsOpen(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const {
        todayCount,
        liveGrowth,
        checkedInIds,
        historicalData,
        loading: attendanceLoading,
        loadingHistory: attendanceHistoryLoading,
        checkIn,
        removeCheckIn,
        fetchHistory,
        refresh: refreshAttendance
    } = useAttendance();

    const { count: memberCount, loading: memberCountLoading } = useMembers({ countOnly: true });
    const { count: expiredCount } = useMembers({ countOnly: true, status: 'Expired' });
    const { count: expiringSoonCount } = useMembers({ countOnly: true, status: 'Expiring Soon' });
    const { count: activeCount } = useMembers({ countOnly: true, status: 'Active' });
    const { distribution: memberDistro } = useMemberDistribution();

    const [attendanceRange, setAttendanceRange] = useState('7d');
    const [revenueRange, setRevenueRange] = useState('7d');

    useEffect(() => {
        fetchHistory(attendanceRange);
    }, [attendanceRange, fetchHistory]);

    const { stats: financeStats, loading: financeLoading, refresh: refreshFinance } = useFinance();

    const revenueTrendData = useMemo(() => {
        const stats = financeStats || { dailyData: [], monthlyData: [] };
        if (revenueRange === '7d') return stats.dailyData?.slice(-7) || [];
        if (revenueRange === '1m') return stats.dailyData?.slice(-30) || [];
        if (revenueRange === '3m') return stats.monthlyData?.slice(-3) || [];
        if (revenueRange === '6m') return stats.monthlyData?.slice(-6) || [];
        if (revenueRange === '1y') return stats.monthlyData?.slice(-12) || [];
        return [];
    }, [revenueRange, financeStats]);

    const {
        members: searchResults,
        loading: searchLoading,
    } = useMembers({
        search,
        limit: 5,
        enabled: search.trim() !== '',
    });

    const isSyncing = attendanceLoading || memberCountLoading || financeLoading;

    const handleCheckIn = async (memberId) => {
        const success = await checkIn(memberId);
        if (success) {
            setSearch('');
            await refreshAttendance();
            await refreshFinance();
        }
    };

    const handleRemove = async (memberId) => {
        const success = await removeCheckIn(memberId);
        if (success) {
            setSearch('');
            await refreshAttendance();
            await refreshFinance();
        }
    };

    const generateDemoData = async () => {
        const confirm = window.confirm("Generate random payment data for the last 7 days?");
        if (!confirm) return;

        try {
            // Get a valid member ID
            const { data: member } = await supabase.from('members').select('id').limit(1).single();
            if (!member) {
                showToast("No members found. Create a member first.", "error");
                return;
            }


            // 1. Clear existing payments to prevent accumulation
            // Retrieve all IDs first to ensure robust deletion (sometimes bulk delete is restricted)
            const { data: existingData } = await supabase.from('payments').select('id');
            if (existingData && existingData.length > 0) {
                const ids = existingData.map(d => d.id);
                const { error: deleteError } = await supabase
                    .from('payments')
                    .delete()
                    .in('id', ids);

                if (deleteError) {
                    console.error("Error clearing payments:", deleteError);
                    showToast("Warning: Could not clear previous data. Check console/permissions.", "error");
                }
            }

            const payments = [];
            for (let i = 0; i < 7; i++) {
                // Generate 2-5 transactions per day to keep total realistic
                const transactionsCount = Math.floor(Math.random() * 4) + 2;

                for (let j = 0; j < transactionsCount; j++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    // Randomize time within the day (8 AM to 8 PM)
                    date.setHours(Math.floor(Math.random() * 13) + 8);
                    date.setMinutes(Math.floor(Math.random() * 60));
                    date.setSeconds(0);

                    // Random amount between 2k and 12k (matches realistic gym fees/products)
                    const amount = Math.floor(Math.random() * (12000 - 2000 + 1)) + 2000;

                    payments.push({
                        member_id: member.id,
                        amount: amount,
                        payment_method: Math.random() > 0.4 ? 'Mobile Money' : 'Cash',
                        transaction_date: date.toISOString()
                    });
                }
            }

            const { error } = await supabase.from('payments').insert(payments);
            if (error) throw error;

            showToast("Demo data generated! Reloading...", "success");
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Demo Data Error:", error);
            showToast("Failed to generate data.", "error");
        }
    };

    const fStats = financeStats || { todayRevenue: 0, todayExpenses: 0, recentTransactions: [], dailyData: [] };

    const quickStats = [
        { label: "Today's Attendance", value: (todayCount || 0).toString(), icon: Users, trend: liveGrowth },
        { label: "Total Members", value: (memberCount || 0).toString(), icon: UserPlus, trend: expiredCount ? -1 : 0, trendLabel: expiredCount ? `${expiredCount} Expired` : undefined },
        { label: "Today's Net Balance", value: `RWF ${Math.abs((fStats.todayRevenue || 0) - (fStats.todayExpenses || 0)).toLocaleString()}`, icon: Activity, trend: ((fStats.todayRevenue || 0) - (fStats.todayExpenses || 0)) >= 0 ? 1 : -1 },
    ];

    return (
        <div className="space-y-7">
            {/* Action Header — desktop & generic mobile title */}
            <div className="flex flex-col gap-5">
                {/* Desktop: Title + Buttons. Mobile: Just Title */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-accent text-[10px] font-bold uppercase tracking-[0.3em] leading-none mb-1">Front Desk</p>
                        <h2 className="text-text text-[25px] font-bold tracking-tighter leading-tight uppercase">Dashboard</h2>
                    </div>
                    
                    {/* Desktop Actions */}
                    <div className="hidden lg:flex flex-wrap items-center gap-2 justify-end">
                        <ReportDropdown />
                        <button
                            onClick={() => onNavigate('attendance')}
                            className="flex items-center gap-2 bg-text/5 text-text px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-text/10 transition-all border border-text/5"
                        >
                            <Calendar size={14} strokeWidth={2.5} /> Check-in
                        </button>
                        <button
                            onClick={() => onNavigate('expenses')}
                            className="flex items-center gap-2 bg-text/5 text-text px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-text/10 transition-all border border-text/5"
                        >
                            <Receipt size={14} strokeWidth={2.5} /> Log Expense
                        </button>
                        <button
                            onClick={() => onNavigate('members', 'register')}
                            className="flex items-center gap-2 bg-primary text-surface px-4 py-2 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={14} strokeWidth={3} /> New Member
                        </button>
                    </div>
                </div>

                {/* Mobile Specific Actions: Search Bar + '+' Dropdown */}
                <div className="flex lg:hidden items-center gap-3">
                    {/* Wide Search Bar */}
                    <div ref={searchRef} className="flex-1 relative">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-accent transition-colors" size={15} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                className="w-full bg-card shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-text/5 rounded-2xl py-2.5 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }}
                                onFocus={() => setSearchOpen(true)}
                            />
                        </div>
                        {/* Search dropdown */}
                        {searchOpen && search.trim() !== '' && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-text/5 rounded-2xl shadow-xl overflow-hidden z-50 divide-y divide-text/5">
                                {searchLoading ? (
                                    <div className="p-4 text-center text-text/30 text-[10px] font-bold uppercase tracking-widest">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-4 text-center text-text/20 text-[10px] font-bold uppercase tracking-widest">No members found</div>
                                ) : searchResults.map(member => (
                                    <div key={member.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors">
                                        <div>
                                            <p className="text-text font-bold text-xs uppercase">{member.full_name}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {member.status !== 'Expired' && (
                                                <button
                                                    onClick={() => handleCheckIn(member.id)}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-colors",
                                                        checkedInIds.includes(member.id)
                                                            ? "bg-success text-white hover:bg-error"
                                                            : "bg-primary text-white hover:bg-accent"
                                                    )}
                                                >
                                                    <CheckCircle2 size={11} strokeWidth={3} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* '+' Dropdown */}
                    <div ref={actionsRef} className="relative shrink-0">
                        <button
                            onClick={() => setActionsOpen(!actionsOpen)}
                            className="w-11 h-11 flex items-center justify-center bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus size={20} strokeWidth={3} className={cn("transition-transform duration-300", actionsOpen && "rotate-45")} />
                        </button>
                        
                        {actionsOpen && (
                            <div className="absolute top-[calc(100%+0.5rem)] right-0 w-52 bg-card border border-text/5 rounded-2xl shadow-xl overflow-visible z-50 divide-y divide-text/5 animate-in fade-in slide-in-from-top-2">
                                <button
                                    onClick={() => { onNavigate('attendance'); setActionsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all rounded-t-2xl"
                                >
                                    <Calendar size={13} strokeWidth={2.5} className="text-primary" /> Check-in
                                </button>
                                <button
                                    onClick={() => { onNavigate('expenses'); setActionsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all"
                                >
                                    <Receipt size={13} strokeWidth={2.5} className="text-accent" /> Log Expense
                                </button>
                                <button
                                    onClick={() => { onNavigate('members', 'register'); setActionsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all"
                                >
                                    <UserPlus size={13} strokeWidth={2.5} className="text-success" /> New Member
                                </button>
                                
                                {/* Inject Report actions directly into dropdown since ReportDropdown mounts its own isolated modal scope */}
                                <div className="p-2 bg-surface/50 rounded-b-2xl">
                                    <ReportDropdown customVariant="mobile-transparent" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Real-time Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickStats.map((stat, i) => (
                    <StatCard key={i} {...stat} featured={true} />
                ))}
            </div>            {/* Main Action Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10">
                {/* Attendance Trends Chart */}
                <Card
                    title="Attendance Trends"
                    subtitle={attendanceRange === '7d' ? "Past 7 Days" : "Past 30 Days"}
                    extra={
                        <div className="flex bg-text/5 p-1 rounded-xl">
                            {['7d', '1m'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setAttendanceRange(r)}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                                        attendanceRange === r ? "bg-accent text-surface shadow-sm" : "text-text/40 hover:text-text"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    }
                >
                    <div className="h-48 w-full mt-4 flex items-end justify-between relative px-2">
                        {(() => {
                            const data = historicalData?.daily || new Array(7).fill({ label: '-', count: 0 });
                            const maxVal = Math.max(...data.map(d => d.count), 5);
                            const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

                            return (
                                <>
                                    {/* Y-Axis & Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none pr-2">
                                        {ticks.reverse().map((tick, i) => (
                                            <div key={i} className="flex items-center gap-2 w-full">
                                                <span className="text-[7px] font-black text-text/30 w-4 text-right tabular-nums">{Math.round(tick)}</span>
                                                <div className="flex-1 border-b border-text/[0.05]" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bars */}
                                    <div className="flex-1 h-full flex items-end justify-between gap-2 relative z-10 px-6">
                                        {data.map((item, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group/bar">
                                                <div
                                                    className={cn(
                                                        "w-full rounded-t-xl transition-all duration-[1000ms] relative min-h-[2px]",
                                                        "bg-gradient-to-t from-secondary/40 to-accent shadow-lg shadow-accent/5 hover:scale-x-110"
                                                    )}
                                                    style={{ height: `${(item.count / maxVal) * 100}%` }}
                                                >
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface text-text border border-text/10 text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm opacity-0 group-hover/bar:opacity-100 transition-opacity z-20">
                                                        {item.count}
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "text-[8px] font-bold uppercase tracking-tighter truncate w-full text-center",
                                                    i === data.length - 1 ? "text-accent" : "text-text/30"
                                                )}>
                                                    {item.label.split(',')[0]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    {historicalData?.peakHour && (
                        <div className="mt-8 pt-4 border-t border-text/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-text/30 uppercase tracking-[0.2em]">Busiest Time Block</span>
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">{historicalData.peakHour} Window</span>
                        </div>
                    )}
                </Card>

                {/* Latest Transactions */}
                <Card title="Transactions">
                    <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {fStats.recentTransactions && fStats.recentTransactions.length > 0 ? (
                            fStats.recentTransactions.slice(0, 7).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 bg-text/[0.02] rounded-2xl border border-text/[0.03]">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center shadow-sm",
                                            tx.type === 'income'
                                                ? (tx.method === 'Mobile Money' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent")
                                                : "bg-error/10 text-error"
                                        )}>
                                            {tx.type === 'income'
                                                ? (tx.method === 'Mobile Money' ? <Smartphone size={12} /> : <Wallet size={12} />)
                                                : <Receipt size={12} />
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-bold text-text truncate">{tx.title}</p>
                                            <p className="text-text/30 text-[10px] font-bold uppercase tracking-wider">{tx.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-xs font-bold tracking-tighter",
                                            tx.type === 'income' ? "text-success" : "text-error"
                                        )}>
                                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center text-text/10 text-[9px] font-bold uppercase tracking-widest">
                                No activity today
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Dual Insights Grid: Member Overview & Revenue Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 mt-10">
                {/* Member Overview Pie Chart */}
                <Card
                    title="Member Overview"
                    subtitle="Categorized Distribution"
                    className="flex flex-col h-full"
                >
                    <div className="flex items-center gap-8 py-4">
                        <div className="relative w-40 h-40 flex-shrink-0">
                            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                                <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="16" className="text-text/5" />
                                {(() => {
                                    let cumulativePercent = 0;
                                    const colors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)', 'var(--color-success)', 'var(--color-error)'];
                                    return memberDistro.map((segment, i) => {
                                        const dashArray = 2 * Math.PI * 70;
                                        const dashOffset = dashArray - (dashArray * segment.percent) / 100;
                                        const rotation = (cumulativePercent * 3.6);
                                        cumulativePercent += segment.percent;
                                        return (
                                            <circle
                                                key={i}
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                fill="transparent"
                                                stroke={colors[i % colors.length]}
                                                strokeWidth="16"
                                                strokeDasharray={dashArray}
                                                strokeDashoffset={dashOffset}
                                                style={{ transformOrigin: 'center', transform: `rotate(${rotation}deg)` }}
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        );
                                    });
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black tracking-tighter text-text">{memberCount}</span>
                                <span className="text-[8px] font-black uppercase text-text/30 tracking-widest">Members</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-3">
                            {memberDistro.slice(0, 4).map((m, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)', 'var(--color-success)'][i] }} />
                                        <span className="text-[10px] font-bold text-text/70 uppercase tracking-wider truncate max-w-[80px]">{m.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-text tabular-nums">{Math.round(m.percent)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status Snapshots */}
                    <div className="mt-8 pt-6 border-t border-text/5 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-[18px] font-black text-success tracking-tighter">{activeCount}</p>
                            <p className="text-[8px] font-black text-text/30 uppercase tracking-widest">Active</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[18px] font-black text-error tracking-tighter">{expiredCount}</p>
                            <p className="text-[8px] font-black text-text/30 uppercase tracking-widest">Expired</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[18px] font-black text-accent tracking-tighter">{expiringSoonCount}</p>
                            <p className="text-[8px] font-black text-text/30 uppercase tracking-widest">Soon</p>
                        </div>
                    </div>
                </Card>

                <Card title="Revenue Trend" subtitle="Growth Intelligence">
                    <div className="flex items-center justify-end -mt-10 mb-4 relative z-20">
                        <div className="flex items-center gap-1 p-1 bg-text/5 rounded-xl">
                            {['7d', '1m', '3m', '6m', '1y'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setRevenueRange(range)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                                        revenueRange === range ? "bg-primary text-surface shadow-md shadow-primary/20" : "text-text/40 hover:text-text/60"
                                    )}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-72 w-full pr-4 relative">
                        {revenueTrendData.length > 1 ? (
                            <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {(() => {
                                    const rawMax = Math.max(...revenueTrendData.map(d => d.revenue), 0);
                                    const maxVal = Math.max(rawMax * 1.1, 1000); // Tight 10% buffer
                                    const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

                                    const points = revenueTrendData.map((d, i) => ({
                                        x: (i / (revenueTrendData.length - 1)) * 360 + 40,
                                        y: 200 - ((d.revenue / maxVal) * 180) - 10
                                    }));
                                    const pathStr = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
                                    const areaStr = `${pathStr} L ${points[points.length - 1].x},200 L 40,200 Z`;

                                    return (
                                        <>
                                            {/* Y-Axis Grid Lines & Labels */}
                                            {ticks.map((tick, i) => {
                                                const yPos = 200 - ((tick / maxVal) * 180) - 10;
                                                return (
                                                    <g key={i}>
                                                        <line x1="40" y1={yPos} x2="400" y2={yPos} stroke="currentColor" className="text-text/[0.08]" strokeDasharray="4 4" />
                                                        <text x="35" y={yPos + 3} textAnchor="end" className="fill-text/40 text-[9px] font-bold tabular-nums italic">
                                                            {tick >= 1000 ? `${Math.round(tick / 1000)}k` : Math.round(tick)}
                                                        </text>
                                                    </g>
                                                );
                                            })}

                                            <path d={areaStr} fill="url(#lineGrad)" className="transition-all duration-1000" />
                                            <path d={pathStr} fill="none" stroke="currentColor" strokeWidth="3" className="text-primary transition-all duration-1000" strokeLinecap="round" strokeLinejoin="round" />

                                            {/* X-Axis labels */}
                                            {points.map((p, i) => {
                                                const skip = Math.max(1, Math.floor(revenueTrendData.length / 8));
                                                if (i % skip !== 0 && i !== points.length - 1) return null;

                                                let label = "";
                                                if (revenueRange === '7d' || revenueRange === '1m') {
                                                    label = revenueTrendData[i].date?.split('-')[2] || "";
                                                } else {
                                                    label = revenueTrendData[i].month?.toUpperCase() || "";
                                                }

                                                return (
                                                    <text key={`label-${i}`} x={p.x} y={195} textAnchor="middle" className="fill-text/40 text-[9px] font-bold uppercase tracking-widest">
                                                        {label}
                                                    </text>
                                                );
                                            })}

                                            {/* Hover dots or markers */}
                                            {points.map((p, i) => (
                                                <g key={`point-${i}`} className="group/dot">
                                                    <circle cx={p.x} cy={p.y} r="4" className="text-primary fill-surface stroke-current stroke-3 opacity-0 group-hover/dot:opacity-100 transition-opacity" />
                                                    <text x={p.x} y={p.y - 12} textAnchor="middle" className="fill-text text-[10px] font-black tracking-tighter opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none drop-shadow-sm">
                                                        {revenueTrendData[i].revenue.toLocaleString()}
                                                    </text>
                                                </g>
                                            ))}
                                        </>
                                    );
                                })()}
                            </svg>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text/20 text-[10px] font-bold uppercase tracking-widest">
                                Insufficient data for trend
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
