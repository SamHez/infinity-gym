import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { Users, TrendingUp, UserPlus, Receipt, Activity, CreditCard, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAttendance, useMembers, useFinance } from '../lib/data-hooks';
import { ReportDropdown } from './ReportDropdown';

const ExecutiveCard = ({ title, mainValue, subLabel, subValue, icon: Icon, trend, trendLabel }) => (
    <div className="bg-card border border-text/5 shadow-sm rounded-[2rem] p-5 flex flex-col justify-between min-h-[140px] group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 relative overflow-hidden">
        {/* Permanent Blue Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-100 transition-all duration-300 group-hover:h-1.5 group-hover:from-primary/70 group-hover:to-primary/70" />
        
        {/* Very subtle background shift entirely by default now faintly glowing */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/[0.015] pointer-events-none group-hover:to-primary/[0.03] transition-colors duration-300" />

        <div className="flex justify-between items-start relative z-10 w-full mb-2">
            <div className="bg-primary/10 text-primary border border-primary/20 p-2.5 rounded-2xl transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/30 group-hover:scale-110 group-hover:shadow-[0_4px_12px_rgba(0,123,255,0.15)]">
                <Icon size={20} strokeWidth={2.5} />
            </div>
            {trend !== undefined && trend !== null && trend !== 0 && (
                <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm border transition-colors duration-300",
                    trend > 0 ? "bg-success/5 text-success border-success/10 group-hover:bg-success/10 group-hover:border-success/20" : "bg-error/5 text-error border-error/10 group-hover:bg-error/10 group-hover:border-error/20"
                )}>
                    {trend > 0 ? '↑' : '↓'} {trendLabel ? trendLabel : `${Math.abs(Math.round(trend))}%`}
                </span>
            )}
        </div>
        <div className="relative z-10 w-full mt-auto">
            <p className="text-text/40 font-bold uppercase tracking-[0.2em] mb-1 text-[9px] transition-colors group-hover:text-text/60">{title}</p>
            <div className="flex items-end justify-between w-full h-10">
                <h3 className="text-3xl font-bold tracking-tighter leading-none text-text flex items-baseline gap-1">
                    {mainValue}
                </h3>
                <div className="text-right shrink-0 flex flex-col justify-end h-full">
                    <p className="text-text/30 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{subLabel}</p>
                    <p className="text-text/60 text-[11px] font-bold leading-none">{subValue}</p>
                </div>
            </div>
        </div>
    </div>
);

export function DashboardSnapshot() {
    const { todayCount, historicalData: attendanceHistory, fetchHistory } = useAttendance();
    const { count: memberCount, stats: memberStats } = useMembers();
    const { stats: financeStats } = useFinance();
    const fStats = financeStats || { revenue: 0, expenses: 0, todayRevenue: 0, todayExpenses: 0, recentTransactions: [], dailyData: [], monthlyData: [], expenseBreakdown: [] };

    const [timeRange, setTimeRange] = useState('7d');
    const [hoveredCategory, setHoveredCategory] = useState(null);

    React.useEffect(() => {
        fetchHistory('7d');
    }, [fetchHistory]);

    // Trend calculations
    const yesterdayRevenue = fStats.dailyData?.[fStats.dailyData.length - 2]?.revenue || 0;
    const revTrend = yesterdayRevenue > 0 ? ((fStats.todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : (fStats.todayRevenue > 0 ? 100 : 0);

    const yesterdayExpenses = fStats.dailyData?.[fStats.dailyData.length - 2]?.expenses || 0;
    const expTrend = yesterdayExpenses > 0 ? ((fStats.todayExpenses - yesterdayExpenses) / yesterdayExpenses) * 100 : (fStats.todayExpenses > 0 ? 100 : 0);

    // Format revenue data for line chart
    const trendData = useMemo(() => {
        const stats = fStats;
        if (timeRange === '7d') return stats.dailyData?.slice(-7) || [];
        if (timeRange === '1m') return stats.dailyData?.slice(-30) || [];
        if (timeRange === '3m') return stats.monthlyData?.slice(-3) || [];
        if (timeRange === '6m') return stats.monthlyData?.slice(-6) || [];
        if (timeRange === '1y') return stats.monthlyData?.slice(-12) || [];
        return [];
    }, [timeRange, fStats]);

    // Donut chart setup
    const ringColors = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-error)', 'var(--color-success)', 'var(--color-text)'];
    const ringSegments = (fStats.expenseBreakdown || []).slice(0, 5);
    let cumulativeOffset = 0;

    return (
        <div className="space-y-10 mb-8 mt-2">
            {/* Action Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-1 leading-none">Management</h2>
                    <p className="text-text text-2xl md:text-3xl font-bold tracking-tighter leading-none uppercase">Dashboard</p>
                </div>
                <ReportDropdown />
            </div>

            {/* Executive KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ExecutiveCard
                    title="Daily Revenue"
                    mainValue={<>{(fStats.todayRevenue || 0).toLocaleString()}<span className="text-[10px] ml-0.5 text-text/30 font-bold uppercase tracking-widest">RWF</span></>}
                    subLabel="All Time Revenue"
                    subValue={`${(fStats.revenue || 0).toLocaleString()} RWF`}
                    icon={CreditCard}
                    trend={revTrend}
                />
                <ExecutiveCard
                    title="Today's Expenses"
                    mainValue={<>{(fStats.todayExpenses || 0).toLocaleString()}<span className="text-[10px] ml-0.5 text-text/30 font-bold uppercase tracking-widest">RWF</span></>}
                    subLabel="All Time Expenses"
                    subValue={`${(fStats.expenses || 0).toLocaleString()} RWF`}
                    icon={Receipt}
                    trend={-expTrend} // Map more expenses to negative trend visually if desired, though normally an up arrow in red is used. If we use trend={-expTrend}, it shows a down arrow in green if expenses drop.
                    trendLabel={`${Math.abs(Math.round(expTrend))}%`} // We override label just to ensure absolute value
                />
                <ExecutiveCard
                    title="Total Members"
                    mainValue={<>{(memberStats?.total || 0).toString()}<span className="text-[10px] ml-0.5 text-text/30 font-bold uppercase tracking-widest">Users</span></>}
                    subLabel="Attendance Today"
                    subValue={(todayCount || 0).toString()}
                    icon={Users}
                    trend={memberStats?.growthPercentage || 0}
                />
            </div>

            {/* Row 1: Finance Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
                <Card subtitle="Revenue Intelligence" title="Revenue Flow">
                    <div className="flex items-center justify-end -mt-11 mb-2 relative z-20">
                        <div className="flex items-center gap-1 p-1 bg-text/5 rounded-xl">
                            {['7d', '1m', '3m', '6m', '1y'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                                        timeRange === range ? "bg-accent text-surface shadow-md shadow-accent/20" : "text-text/40 hover:text-text/60"
                                    )}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-64 w-full relative -ml-2">
                        {trendData.length > 1 ? (
                            <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="lineGradAccent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {(() => {
                                    const rawMax = Math.max(...trendData.map(d => d.revenue), 0);
                                    const maxVal = Math.max(rawMax * 1.1, 1000);
                                    const ticks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

                                    const points = trendData.map((d, i) => ({
                                        x: (i / (trendData.length - 1)) * 360 + 35,
                                        y: 200 - ((d.revenue / maxVal) * 180) - 10
                                    }));
                                    const pathStr = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
                                    const areaStr = `${pathStr} L ${points[points.length - 1].x},200 L 35,200 Z`;

                                    return (
                                        <>
                                            {/* Y-Axis */}
                                            {ticks.map((tick, i) => {
                                                const yPos = 200 - ((tick / maxVal) * 180) - 10;
                                                return (
                                                    <g key={i}>
                                                        <line x1="35" y1={yPos} x2="400" y2={yPos} stroke="currentColor" className="text-text/[0.05]" strokeDasharray="3 3" />
                                                        <text x="30" y={yPos + 3} textAnchor="end" className="fill-text/30 text-[8px] font-bold tabular-nums">
                                                            {tick >= 1000 ? `${Math.round(tick / 1000)}k` : Math.round(tick)}
                                                        </text>
                                                    </g>
                                                );
                                            })}

                                            <path d={areaStr} fill="url(#lineGradAccent)" className="transition-all duration-1000" />
                                            <path d={pathStr} fill="none" stroke="currentColor" strokeWidth="3" className="text-accent transition-all duration-1000" strokeLinecap="round" strokeLinejoin="round" />

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
                                                    <text key={`label-${i}`} x={p.x} y={198} textAnchor="middle" className="fill-text/30 text-[8px] font-bold uppercase tracking-widest">
                                                        {label}
                                                    </text>
                                                );
                                            })}

                                            {/* Hover dots */}
                                            {points.map((p, i) => (
                                                <g key={`point-${i}`} className="group/dot relative z-50">
                                                    <circle cx={p.x} cy={p.y} r="8" fill="transparent" className="cursor-pointer" />
                                                    <circle cx={p.x} cy={p.y} r="3.5" className="text-accent fill-surface stroke-current stroke-3 opacity-0 group-hover/dot:opacity-100 transition-opacity" />
                                                    <text x={p.x} y={p.y - 12} textAnchor="middle" className="fill-text text-[9px] font-black tracking-tighter opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none drop-shadow-sm">
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

                <Card subtitle="Live Feed" title="Recent Transactions" className="flex flex-col h-full overflow-hidden">
                    <div className="mt-4 flex flex-col gap-3 flex-1 overflow-y-auto max-h-[300px]">
                        {(fStats.recentTransactions || []).slice(0, 6).map((trx) => (
                            <div key={trx.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-surface border border-text/5 transition-all hover:border-primary/20">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                                        trx.type === 'income' ? "bg-success/10 text-success" : "bg-error/10 text-error"
                                    )}>
                                        {trx.type === 'income' ? <Plus size={14} strokeWidth={3} /> : <Activity size={14} strokeWidth={3} />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-text truncate max-w-[140px]">{trx.title}</p>
                                        <p className="text-[9px] font-bold text-text/30 uppercase tracking-widest">{trx.method}</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-xs font-black whitespace-nowrap tracking-tight",
                                    trx.type === 'income' ? "text-success" : "text-error"
                                )}>
                                    {trx.type === 'income' ? '+' : '-'} {(trx.amount / 1000).toFixed(1)}k
                                </span>
                            </div>
                        ))}
                        {(!fStats.recentTransactions || fStats.recentTransactions.length === 0) && (
                            <p className="text-text/30 text-[10px] text-center py-4 font-bold my-auto uppercase tracking-widest">No recent activity</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Row 2: Operational Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-8">
                <Card subtitle="Base Status" title="Members Overview">
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-success/5 border border-success/10 hover:bg-success/10 transition-colors">
                            <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_10px_rgba(46,204,113,0.4)]"/><span className="text-[11px] font-bold uppercase tracking-wider text-text">Active Cohort</span></div>
                            <span className="font-bold text-text text-xl tracking-tighter">{memberStats?.active || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors">
                            <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(243,156,18,0.4)]"/><span className="text-[11px] font-bold uppercase tracking-wider text-text">Expiring Soon (7d)</span></div>
                            <span className="font-bold text-text text-xl tracking-tighter">{memberStats?.expiringSoon || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-error/5 border border-error/10 hover:bg-error/10 transition-colors">
                            <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_10px_rgba(231,76,60,0.4)]"/><span className="text-[11px] font-bold uppercase tracking-wider text-text">Expired / Churned</span></div>
                            <span className="font-bold text-text text-xl tracking-tighter">{memberStats?.expired || 0}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Expenses Breakdown" subtitle="Allocation" className="flex flex-col">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2 h-full">
                        <div className="relative w-48 h-48 group flex-shrink-0">
                            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                                <circle cx="80" cy="80" r="58" fill="transparent" stroke="currentColor" strokeWidth="16" className="text-text/5" />
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
                                            strokeDasharray={`${Math.max(0, segmentLength)} ${circumferenceLarge}`}
                                            strokeDashoffset={dashOffset}
                                            className="transition-all duration-500 origin-center cursor-pointer"
                                            onMouseEnter={() => setHoveredCategory(segment.category)}
                                            onMouseLeave={() => setHoveredCategory(null)}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden px-2">
                                <span className="text-xl font-black tracking-tighter text-text truncate">
                                    {(fStats.expenses || 0).toLocaleString()}
                                </span>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-text/30 mt-1">
                                    Total Logged
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-3">
                            {ringSegments.map((item, i) => (
                                <div
                                    key={item.category}
                                    className={cn(
                                        "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer",
                                        hoveredCategory === item.category ? "bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-text/10 scale-[1.02]" : "border-text/5 hover:border-text/10"
                                    )}
                                    onMouseEnter={() => setHoveredCategory(item.category)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: ringColors[i % ringColors.length] }} />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-text leading-tight">{item.category}</span>
                                            <span className="text-[9px] font-bold text-text/40 tracking-widest uppercase">{Math.round(item.percent)}%</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black tracking-tighter">
                                        RWF {item.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            {ringSegments.length === 0 && (
                                <p className="text-text/30 text-[10px] text-center font-bold uppercase tracking-widest my-auto">No expenses recorded</p>
                            )}
                        </div>
                    </div>
                </Card>

                <Card subtitle="Analytics" title="Peak Operations" className="flex flex-col justify-center">
                    <div className="text-center space-y-10 py-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text/30 mb-2">Busiest Hourly Window</p>
                            <p className="text-4xl font-black tracking-tighter text-primary">{attendanceHistory?.peakHour || '-'}</p>
                        </div>
                        <div className="mx-auto w-12 h-px bg-text/10" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text/30 mb-2">Operational High Day</p>
                            <p className="text-3xl font-black tracking-tighter text-accent">{attendanceHistory?.peakDay || '-'}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
