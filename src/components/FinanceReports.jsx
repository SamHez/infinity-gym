import React from 'react';
import { Card } from './Card';
import { TrendingUp, Wallet, Smartphone, Loader2, Receipt, CircleDollarSign, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useFinance } from '../lib/data-hooks';
import { ReportDropdown } from './ReportDropdown';

export function FinanceReports({ onNavigate }) {
    const { stats: rawStats, loading } = useFinance();

    // Defensive stats with defaults
    const stats = rawStats || {
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        todayRevenue: 0,
        todayExpenses: 0,
        transactions: 0,
        mobileRevenue: 0,
        cashRevenue: 0,
        expenseBreakdown: [],
        monthlyData: [],
        dailyData: [],
        recentTransactions: []
    };

    const ringSegments = stats.expenseBreakdown?.slice(0, 4) || [];
    const ringColors = ['#1E88E5', '#F4B740', '#2ECC71', '#EF4444'];
    let cumulativeOffset = 0;

    const [timeRange, setTimeRange] = React.useState('3m');
    const [hoveredCategory, setHoveredCategory] = React.useState(null);
    const [visibleTransactions, setVisibleTransactions] = React.useState(10);

    // Line Chart Data Logic
    const trendData = React.useMemo(() => {
        if (timeRange === '7d') return stats.dailyData?.slice(-7) || [];
        if (timeRange === '1m') return stats.dailyData?.slice(-30) || [];
        if (timeRange === '3m') return stats.monthlyData?.slice(-3) || [];
        if (timeRange === '6m') return stats.monthlyData?.slice(-6) || [];
        if (timeRange === '1y') return stats.monthlyData?.slice(-12) || [];
        return [];
    }, [timeRange, stats]);

    if (loading) {
        return (
            <div className="min-h-[420px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-text/40">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em]">Loading Finance Data...</p>
                </div>
            </div>
        );
    }

    const transactions = stats.recentTransactions || [];

    return (
        <div className="space-y-10">
            {/* Finance Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-primary text-[11px] font-bold uppercase tracking-[0.4em] mb-2 leading-none ">Cash Overview</h2>
                    <p className="text-text text-3xl md:text-4xl font-bold tracking-tighter leading-none uppercase">FINANCES</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <ReportDropdown />
                    <button
                        onClick={() => onNavigate('finance', 'finance_reports_add')}
                        className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Add Income
                    </button>
                </div>
            </div>

            {/* Top Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <Card className="overflow-hidden relative group border border-text/5 shadow-premium">
                    <div className="absolute -right-4 -top-4 p-8 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <CircleDollarSign size={120} className="text-primary" />
                    </div>
                    <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Revenue Today</p>
                    <div className="flex items-end gap-3 relative z-10">
                        <h3 className="text-4xl font-bold tracking-tighter text-text">{stats.todayRevenue.toLocaleString()}</h3>
                        <span className="text-[10px] text-text/10">RWF</span>
                    </div>
                    <div className="mt-8 text-[10px] font-medium text-text/30 uppercase tracking-widest">
                        Cash and mobile money received today
                    </div>
                </Card>

                <Card className="border border-text/5 flex flex-col justify-between" title="">
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Total Revenue</p>
                        <h3 className="text-4xl font-bold tracking-tighter  text-text">{stats.revenue.toLocaleString()} <span className="text-[10px] not- text-text/10">RWF</span></h3>
                    </div>
                    <div className="pt-6 border-t border-text/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-text/30">Payments</span>
                        <span className="text-text">{stats.transactions} Records</span>
                    </div>
                </Card>

                <Card className="border border-text/5 flex flex-col justify-between" title="">
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Total Expenses</p>
                        <h3 className="text-4xl font-bold tracking-tighter text-error">{stats.expenses.toLocaleString()} <span className="text-[10px] not- text-text/10">RWF</span></h3>
                    </div>
                    <div className="pt-6 border-t border-text/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-text/30">Spent Today</span>
                        <span className="text-text">{stats.todayExpenses.toLocaleString()} RWF</span>
                    </div>
                </Card>

                <Card className="border border-text/5 flex flex-col justify-between" title="">
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Net Income</p>
                        <h3 className={cn(
                            "text-4xl font-bold tracking-tighter",
                            stats.netProfit >= 0 ? "text-success" : "text-error"
                        )}>
                            {stats.netProfit.toLocaleString()} <span className="text-[10px] text-text/10">RWF</span>
                        </h3>
                    </div>
                    <div className="pt-6 border-t border-text/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-text/30">Margin</span>
                        <span className="text-text">{stats.revenue > 0 ? ((stats.netProfit / stats.revenue) * 100).toFixed(1) : 0}%</span>
                    </div>
                </Card>
            </div>

            {/* Charts and Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Trend */}
                <Card title="Revenue Trend" subtitle="Growth Intelligence">
                    <div className="flex items-center justify-end -mt-12 mb-4 relative z-20">
                        <div className="flex items-center gap-1 p-1 bg-text/5 rounded-xl">
                            {['7d', '1m', '3m', '6m', '1y'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                                        timeRange === range ? "bg-primary text-surface shadow-md shadow-primary/20" : "text-text/40 hover:text-text/60"
                                    )}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-72 w-full pr-4 relative">
                        {trendData.length > 1 ? (
                            <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {(() => {
                                    const rawMax = Math.max(...trendData.map(d => d.revenue), 0);
                                    const maxVal = Math.max(rawMax * 1.1, 1000); // Tight 10% buffer
                                    const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

                                    const points = trendData.map((d, i) => ({
                                        x: (i / (trendData.length - 1)) * 360 + 40,
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
                                                const skip = Math.max(1, Math.floor(trendData.length / 8));
                                                if (i % skip !== 0 && i !== points.length - 1) return null;

                                                let label = "";
                                                if (timeRange === '7d' || timeRange === '1m') {
                                                    label = trendData[i].date?.split('-')[2] || "";
                                                } else {
                                                    label = trendData[i].month?.toUpperCase() || "";
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
                                                        {trendData[i].revenue.toLocaleString()}
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

                {/* Expenses Breakdown */}
                <Card title="Expenses Breakdown" subtitle="Allocation">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-2">
                        <div className="relative w-56 h-56 group flex-shrink-0">
                            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="58"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    className="text-text/5"
                                />
                                {ringSegments.map((segment, index) => {
                                    const circumferenceLarge = 2 * Math.PI * 58;
                                    const gapValue = ringSegments.length > 1 ? 8 : 0;
                                    const segmentLength = (circumferenceLarge * (segment.percent / 100)) - (gapValue > 0 ? gapValue : 0);
                                    const dashOffset = -cumulativeOffset;
                                    cumulativeOffset += segmentLength + gapValue;
                                    const isHovered = hoveredCategory === segment.category;

                                    return (
                                        <circle
                                            key={segment.category}
                                            cx="80"
                                            cy="80"
                                            r="58"
                                            fill="transparent"
                                            stroke={ringColors[index % ringColors.length]}
                                            strokeWidth={isHovered ? "20" : "16"}
                                            strokeLinecap="round"
                                            strokeDasharray={`${segmentLength} ${circumferenceLarge - segmentLength}`}
                                            strokeDashoffset={dashOffset}
                                            className="transition-all duration-500 cursor-pointer"
                                            onMouseEnter={() => setHoveredCategory(segment.category)}
                                            onMouseLeave={() => setHoveredCategory(null)}
                                            style={{ opacity: hoveredCategory && !isHovered ? 0.3 : 1 }}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-500">
                                <p className={cn(
                                    "font-black tracking-tighter text-text transition-all duration-300 drop-shadow-sm",
                                    hoveredCategory ? "text-xl" : "text-2xl"
                                )}>
                                    {hoveredCategory
                                        ? stats.expenseBreakdown.find(s => s.category === hoveredCategory)?.amount.toLocaleString()
                                        : stats.expenses.toLocaleString()
                                    }
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text/30 max-w-[100px] truncate leading-none mt-1">
                                    {hoveredCategory || "Total Spent"}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 w-full flex flex-col justify-center gap-2">
                            {ringSegments.length === 0 ? (
                                <p className="text-center text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] py-8">
                                    No expense records yet
                                </p>
                            ) : ringSegments.map((segment, index) => (
                                <div
                                    key={segment.category}
                                    className={cn(
                                        "flex items-center justify-between gap-3 p-2.5 rounded-2xl transition-all duration-300 border border-transparent shadow-sm",
                                        hoveredCategory === segment.category ? "bg-text/5 border-text/5 scale-[1.02] shadow-md" : "hover:bg-text/[0.02]"
                                    )}
                                    onMouseEnter={() => setHoveredCategory(segment.category)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <div className="flex items-center gap-1">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full shadow-inner"
                                            style={{ backgroundColor: ringColors[index % ringColors.length] }}
                                        />
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text">
                                                {segment.category}
                                            </span>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-text/25">
                                                {segment.percent.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-black tracking-tighter text-text">
                                            {segment.amount.toLocaleString()} <span className="text-[9px] text-text/20">RWF</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Transactions & Payment Methods Header Integration */}
            <Card>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-text/5 pb-8">
                    <div>
                        <p className="text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Combined Audit Trail</p>
                        <h3 className="text-text font-bold text-2xl tracking-tighter uppercase ">Recent Transactions</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-4 bg-surface border border-text/5 px-6 py-3 rounded-2xl shadow-sm">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Smartphone size={16} />
                            </div>
                            <div>
                                <p className="text-text/30 text-[15px] font-bold uppercase tracking-widest leading-tight">Mobile Money</p>
                                <p className="text-lg font-bold tracking-tighter text-text">{stats.mobileRevenue.toLocaleString()} RWF</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-surface border border-text/5 px-6 py-3 rounded-2xl shadow-sm">
                            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                <Wallet size={16} />
                            </div>
                            <div>
                                <p className="text-text/30 text-[15px] font-bold uppercase tracking-widest leading-tight">Cash Revenue</p>
                                <p className="text-lg font-bold tracking-tighter text-text">{stats.cashRevenue.toLocaleString()} RWF</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="py-20 text-center text-text/20 text-[10px] font-bold uppercase tracking-[0.4em]">
                            No transactions recorded yet
                        </div>
                    ) : (
                        <>
                            {transactions.slice(0, visibleTransactions).map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-5 bg-text/[0.02] rounded-[2rem] border border-text/[0.03] group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                                            transaction.type === 'income'
                                                ? (transaction.method === 'Mobile Money' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent")
                                                : "bg-error/10 text-error"
                                        )}>
                                            {transaction.type === 'income'
                                                ? (transaction.method === 'Mobile Money' ? <Smartphone size={18} /> : <Wallet size={18} />)
                                                : <Receipt size={18} />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-text font-bold tracking-tight text-lg">{transaction.title}</p>
                                            <p className="text-text/20 text-[11px] font-bold uppercase tracking-widest">
                                                {new Date(transaction.date).toLocaleDateString()} via {transaction.method}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-lg font-bold tracking-tighter",
                                            transaction.type === 'income' ? "text-success" : "text-error"
                                        )}>
                                            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}
                                        </p>
                                        <p className={cn(
                                            "text-[8px] font-bold uppercase tracking-widest",
                                            transaction.type === 'income' ? "text-success" : "text-error/50"
                                        )}>{transaction.subtitle}</p>
                                    </div>
                                </div>
                            ))}

                            {visibleTransactions < transactions.length && (
                                <div className="pt-6 flex justify-center">
                                    <button
                                        onClick={() => setVisibleTransactions(prev => prev + 10)}
                                        className="px-8 py-3 rounded-2xl border border-text/5 text-text/40 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-text/5 hover:text-text transition-all"
                                    >
                                        Load More Activity
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
