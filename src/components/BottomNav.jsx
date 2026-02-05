import React from 'react';
import { LayoutDashboard, Users, UserCheck, CreditCard, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

import { NavLink } from 'react-router-dom';

export function BottomNav({ user }) {
    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home', path: '/dashboard', role: 'both' },
        { id: 'members', icon: Users, label: 'Members', path: '/members', role: 'both' },
        { id: 'attendance', icon: UserCheck, label: 'Check-in', path: '/attendance', role: 'both' },
        { id: 'finance', icon: CreditCard, label: 'Finance', path: '/finance', role: 'both' },
        // { id: 'trainers', icon: Activity, label: 'Elite', path: '/trainers', role: 'manager' },
    ];

    const filteredTabs = tabs.filter(tab =>
        tab.role === 'both' || tab.role === user?.role
    );

    return (
        <nav className="fixed lg:hidden bottom-0 left-0 right-0 h-28 bg-card/90 backdrop-blur-2xl border-t border-text/5 px-4 flex justify-around items-center z-50 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.05)] pb-10 transition-all duration-300">
            {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <NavLink
                        key={tab.id}
                        to={tab.path}
                        className={({ isActive }) => cn(
                            "flex flex-col items-center gap-2 transition-all duration-500 relative px-4 py-2 rounded-[2rem]",
                            isActive ? "text-primary scale-110" : "text-text/20"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-accent rounded-full shadow-[0_4px_10px_rgba(201,166,70,0.4)]" />
                                )}
                                <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                                <span className="text-[8px] font-black tracking-[0.2em] uppercase leading-none">{tab.label}</span>
                            </>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
}
