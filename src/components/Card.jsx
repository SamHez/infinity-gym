import React from 'react';
import { cn } from '../lib/utils';

export function Card({ children, className, title, subtitle, ...props }) {
    return (
        <div className={cn("glass-card p-5 md:p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-2 duration-500", className)} {...props}>
            {(title || subtitle) && (
                <div className="mb-6">
                    {subtitle && <p className="text-accent text-[9px] font-bold uppercase tracking-[0.3em] mb-1 leading-none">{subtitle}</p>}
                    {title && <h3 className="text-text font-bold text-lg md:text-xl tracking-tighter uppercase ">{title}</h3>}
                </div>
            )}
            {children}
        </div>
    );
}

export function StatCard({ label, value, trend, trendLabel, icon: Icon, colorClass = "text-text", featured = false }) {
    return (
        <Card className={cn(
            "flex flex-col justify-between min-h-[140px] group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden",
            featured ? "liquid-glass shadow-xl shadow-primary/10 shimmer-bg" : "border border-text/5 shadow-premium"
        )}>
            {featured && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.05] rounded-full -mr-16 -mt-16 blur-2xl" />
            )}
            <div className="flex justify-between items-start relative z-10">
                <div className={cn(
                    "p-3 rounded-2xl border transition-all duration-300",
                    featured
                        ? "bg-primary text-surface border-primary/20 shadow-lg shadow-primary/20"
                        : "bg-surface text-text/40 border-text/[0.03] group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                    {Icon && <Icon size={featured ? 22 : 20} strokeWidth={2.5} />}
                </div>
                {trend !== undefined && trend !== null && trend !== 0 && (
                    <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm border",
                        trend > 0 ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"
                    )}>
                        {trend > 0 ? '↑' : '↓'} {trendLabel ? trendLabel : `${Math.abs(trend)}%`}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <p className={cn(
                    "font-bold uppercase tracking-[0.2em] mb-1 leading-none",
                    featured ? "text-primary/60 text-[9px]" : "text-text/30 text-[8px]"
                )}>{label}</p>
                <div className="flex items-baseline gap-1">
                    <p className={cn(
                        "font-bold tracking-tighter leading-none ",
                        featured ? "text-4xl text-text" : "text-3xl " + colorClass
                    )}>{value}</p>
                    {featured && <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />}
                </div>
            </div>
        </Card>
    );
}
