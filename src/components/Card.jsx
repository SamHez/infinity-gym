import React from 'react';
import { cn } from '../lib/utils';

export function Card({ children, className, title, subtitle }) {
    return (
        <div className={cn("glass-card p-6 md:p-8 rounded-[2.5rem] animate-in fade-in slide-in-from-bottom-2 duration-500", className)}>
            {(title || subtitle) && (
                <div className="mb-8">
                    {subtitle && <p className="text-accent text-[9px] font-bold uppercase tracking-[0.3em] mb-1 leading-none">{subtitle}</p>}
                    {title && <h3 className="text-text font-bold text-xl md:text-2xl tracking-tighter uppercase ">{title}</h3>}
                </div>
            )}
            {children}
        </div>
    );
}

export function StatCard({ label, value, trend, icon: Icon, colorClass = "text-text" }) {
    return (
        <Card className="flex flex-col justify-between min-h-[160px] group hover:scale-[1.02] transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className="p-4 bg-surface rounded-[1.5rem] border border-text/[0.03] group-hover:bg-accent/10 group-hover:text-accent transition-all duration-300 text-text/40">
                    {Icon && <Icon size={24} strokeWidth={2.5} />}
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-bold px-3 py-1 rounded-xl shadow-sm",
                        trend > 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    )}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-text/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className={cn("text-4xl font-bold tracking-tighter ", colorClass)}>{value}</p>
            </div>
        </Card>
    );
}
