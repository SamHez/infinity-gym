import React from 'react';
import { LayoutDashboard, Users, UserCheck, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';

import { NavLink } from 'react-router-dom';

export function BottomNav({ user }) {
    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home', path: '/dashboard', role: 'both' },
        { id: 'members', icon: Users, label: 'Members', path: '/members', role: 'both' },
        { id: 'attendance', icon: UserCheck, label: 'Check-in', path: '/attendance', role: 'both' },
        { id: 'finance', icon: CreditCard, label: 'Finance', path: '/finance', role: 'both' },
    ];

    const filteredTabs = tabs.filter(tab =>
        tab.role === 'both' || tab.role === user?.role
    );

    return (
        <nav className="fixed lg:hidden bottom-3 left-3 right-3 h-16 bg-card/92 backdrop-blur-2xl border border-text/5 px-2 flex justify-around items-center z-50 rounded-[1.75rem] shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
            {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <NavLink
                        key={tab.id}
                        to={tab.path}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative min-w-[64px] h-12 rounded-2xl",
                            isActive ? "text-primary bg-primary/8" : "text-text/25"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full shadow-[0_4px_10px_rgba(30,136,229,0.35)]" />
                                )}
                                <Icon size={20} strokeWidth={isActive ? 3 : 2.25} />
                                <span className="text-[7px] font-black tracking-[0.16em] uppercase leading-none">{tab.label}</span>
                            </>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
}
