import React from 'react';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    CreditCard,
    Activity,
    LogOut,
    User,
    ChevronRight,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import logo from '../assets/logo.png';
import { cn } from '../lib/utils';

import { NavLink } from 'react-router-dom';

export function Sidebar({ activeTab, user, onLogout }) {
    const { theme, toggleTheme } = useTheme();

    // Role-based tabs
    const allTabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', role: 'both' },
        { id: 'members', icon: Users, label: 'Members', path: '/members', role: 'both' },
        { id: 'attendance', icon: UserCheck, label: 'Attendance', path: '/attendance', role: 'both' },
        { id: 'finance', icon: CreditCard, label: 'Finance', path: '/finance', role: 'both' },
        // { id: 'trainers', icon: Activity, label: 'Trainers', path: '/trainers', role: 'manager' },
        // { id: 'expiry', icon: Bell, label: 'Expiry', path: '/expiry', role: 'manager' },
    ];

    const filteredTabs = allTabs.filter(tab =>
        tab.role === 'both' || tab.role === user?.role
    );

    return (
        <aside className="hidden lg:flex flex-col w-80 fixed left-0 top-0 bottom-0 bg-card border-r border-text/5 z-50 transition-all duration-300">
            {/* Brand Header */}
            <div className="p-10 pb-12">
                <div className="flex items-center gap-4 mb-2">
                    <img src={logo} alt="Infinity Gym" className="h-10 w-auto" />
                    <h2 className="text-text font-bold text-1xl tracking-tighter">INFINITY GYM</h2>
                </div>
                <p className="hidden text-accent text-[10px] font-bold uppercase tracking-[0.4em] ml-1">Gym Suite</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-6 space-y-2">
                {filteredTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <NavLink
                            key={tab.id}
                            to={tab.path}
                            className={({ isActive }) => cn(
                                "w-full flex items-center gap-5 px-6 py-4 rounded-3xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-premium"
                                    : "text-text/40 hover:text-text hover:bg-surface"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "text-accent")} />
                                    <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                                    {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Tools & Persistence */}
            <div className="p-8 space-y-6">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-5 bg-surface rounded-3xl border border-text/5 text-text/40 hover:text-accent transition-all group"
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest">Active Look</span>
                    {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="bg-surface/50 p-6 rounded-[2.5rem] border border-text/5">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="text-text font-bold text-sm tracking-tight">{user?.role === 'manager' ? 'Admin Manager' : 'Front Desk'}</p>
                            <p className="text-text/30 text-[9px] font-bold uppercase tracking-tighter truncate max-w-[120px]">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-card border border-text/5 hover:bg-error/5 hover:text-error hover:border-error/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}

export function MobileHeader({ user, onLogout }) {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <header className="fixed lg:hidden top-0 left-0 right-0 h-24 bg-surface/80 backdrop-blur-2xl border-b border-text/5 z-[60] px-6 flex justify-between items-center transition-all">
            <div className="flex items-center gap-3">
                <img src={logo} alt="Infinity Gym" className="h-8 w-auto" />
                <div className="h-5 w-[2px] bg-text/5" />
                <h1 className="text-text font-bold text-lg tracking-tighter uppercase ">Infinity</h1>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-3 bg-card border border-text/5 rounded-2xl shadow-premium text-text/40"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={cn(
                            "relative p-3 bg-card border border-text/5 rounded-2xl shadow-premium transition-all",
                            isMenuOpen ? "text-accent border-accent/20" : "text-text/40"
                        )}
                    >
                        <User size={18} />
                    </button>

                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute top-16 right-0 w-64 bg-card border border-text/5 rounded-[2rem] shadow-premium p-6 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
                                        {user?.email?.[0].toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-text font-bold text-xs tracking-tight truncate uppercase">{user?.role === 'manager' ? 'Admin Manager' : 'Front Desk'}</p>
                                        <p className="text-text/30 text-[9px] font-bold uppercase tracking-tighter truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-error/5 text-error border border-error/10 hover:bg-error hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
