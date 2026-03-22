import React from 'react';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    CreditCard,
    Menu,
    ChevronRight,
    Sun,
    Moon,
    Receipt,
    LogOut,
    Search,
    Plus,
    CheckCircle2,
    TrendingUp,
    FileText,
    Download,
    Mail,
    UserPlus,
    X
} from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import logo from '../assets/logo.png';
import { cn } from '../lib/utils';

import { NavLink } from 'react-router-dom';
import { useMembers, useAttendance } from '../lib/data-hooks';

function getTabsForUser(user) {
    const isManager = user?.role === 'manager' || user?.role === 'admin';

    return isManager
        ? [
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { id: 'finance', icon: CreditCard, label: 'Finance', path: '/finance' },
            { id: 'expenses', icon: Receipt, label: 'Expenses', path: '/expenses' },
            { id: 'members', icon: Users, label: 'Members', path: '/members' },
            { id: 'attendance', icon: UserCheck, label: 'Attendance', path: '/attendance' },
        ]
        : [
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { id: 'attendance', icon: UserCheck, label: 'Attendance', path: '/attendance' },
            { id: 'members', icon: Users, label: 'Members', path: '/members' },
            { id: 'expenses', icon: Receipt, label: 'Expenses', path: '/expenses' },
            { id: 'finance', icon: CreditCard, label: 'Finance', path: '/finance' },
        ];
}

export function Sidebar({ activeTab, user, onLogout, isCollapsed, onToggleCollapse }) {
    const filteredTabs = getTabsForUser(user);

    return (
        <aside className={cn(
            "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-card border-r border-text/5 z-50 transition-all duration-500 overflow-visible liquid-glass",
            isCollapsed ? "w-20" : "w-72"
        )}>
            {/* Collapse Toggle */}
            <button
                onClick={onToggleCollapse}
                className="absolute -right-4 top-10 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-premium hover:scale-110 active:scale-95 transition-all z-10"
            >
                {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} className="rotate-180" />}
            </button>

            {/* Brand Header — hide logo when collapsed, it moves to TopNav */}
            <div className={cn("p-10 transition-all", isCollapsed ? "px-5" : "pb-12")}>
                {!isCollapsed && (
                    <div className="flex items-center gap-4 mb-2 overflow-hidden whitespace-nowrap">
                        <img src={logo} alt="Infinity Gym" className="h-15 w-auto flex-shrink-0" />
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <nav className={cn("flex-1 space-y-1 px-6", isCollapsed && "px-4")}>
                {filteredTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <NavLink
                            key={tab.id}
                            to={tab.path}
                            className={({ isActive }) => cn(
                                "w-full flex items-center rounded-2xl transition-all duration-500 group relative overflow-hidden",
                                isCollapsed ? "justify-center p-5" : "gap-6 px-8 py-5",
                                isActive
                                    ? "bg-primary text-white shadow-[0_20px_40px_rgba(30,136,229,0.3)] scale-[0.9]"
                                    : "text-text/30 hover:text-primary hover:bg-primary/5"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Sidebar Hover Tooltip for Collapsed View */}
                                    {isCollapsed && (
                                        <div className="absolute left-[calc(100%+1rem)] bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 translate-x-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all z-[100] shadow-premium whitespace-nowrap">
                                            {tab.label}
                                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-primary rotate-45" />
                                        </div>
                                    )}

                                    <Icon
                                        size={22}
                                        strokeWidth={isActive ? 3 : 2}
                                        className={cn("transition-all duration-500 flex-shrink-0", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "group-hover:scale-110 group-hover:text-primary")}
                                    />
                                    {!isCollapsed && <span className="font-black text-xs uppercase tracking-[0.15em] whitespace-nowrap">{tab.label}</span>}
                                    {!isCollapsed && isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}

export function TopNav({ user, onLogout, isSidebarCollapsed, activeTab, onNavigate }) {
    const { theme, toggleTheme } = useTheme();

    const isFrontDesk = user?.role !== 'manager' && user?.role !== 'admin';
    const isOnDashboard = activeTab === 'dashboard';

    // Quick search state
    const [searchOpen, setSearchOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const searchRef = React.useRef(null);

    // Quick Actions dropdown state
    const [actionsOpen, setActionsOpen] = React.useState(false);
    const actionsRef = React.useRef(null);

    const { members: searchResults, loading: searchLoading } = useMembers({
        search,
        limit: 5,
        enabled: search.trim().length > 0,
    });
    const { checkedInIds, checkIn, removeCheckIn, refresh: refreshAttendance } = useAttendance();

    const handleCheckIn = async (memberId) => {
        const success = checkedInIds.includes(memberId)
            ? await removeCheckIn(memberId)
            : await checkIn(memberId);
        if (success) { setSearch(''); await refreshAttendance(); }
    };

    // Close dropdowns on outside click
    React.useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
            if (actionsRef.current && !actionsRef.current.contains(e.target)) setActionsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-text/5 px-6 py-3 flex items-center gap-4 transition-all">
            {/* Logo — only when sidebar is collapsed */}
            {isSidebarCollapsed && (
                <img src={logo} alt="Infinity Gym" className="h-10 w-auto flex-shrink-0" />
            )}

            {/* Wide Search Bar */}
            <div ref={searchRef} className="flex-1 max-w-xl relative">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-accent transition-colors" size={15} />
                        <input
                            type="text"
                            placeholder="Search members by name or phone..."
                            className="w-full bg-text/[0.04] border border-text/10 rounded-2xl py-2.5 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-accent/40 focus:bg-card transition-all"
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
                                        <p className="text-text/30 text-[9px] font-bold uppercase tracking-wide">{member.category}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-[8px] font-bold px-2 py-0.5 rounded-md uppercase",
                                            member.status === 'Active' ? "bg-success/10 text-success" :
                                                member.status === 'Expiring Soon' ? "bg-accent/10 text-accent" : "bg-error/10 text-error"
                                        )}>{member.status}</span>
                                        {member.status !== 'Expired' && (
                                            <button
                                                onClick={() => handleCheckIn(member.id)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors",
                                                    checkedInIds.includes(member.id)
                                                        ? "bg-success text-white hover:bg-error"
                                                        : "bg-primary text-white hover:bg-accent"
                                                )}
                                                title={checkedInIds.includes(member.id) ? "Undo Check-in" : "Check In"}
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

            {/* Quick Actions dropdown — all pages */}
            {onNavigate && (
                <div ref={actionsRef} className="relative flex-shrink-0">
                    <button
                        onClick={() => setActionsOpen(!actionsOpen)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
                    >
                        <Plus size={13} strokeWidth={3} />
                        Quick Actions
                        <ChevronRight size={11} className={cn("transition-transform", actionsOpen ? "rotate-90" : "rotate-0")} />
                    </button>
                    {actionsOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-text/5 rounded-2xl shadow-xl overflow-visible z-50 divide-y divide-text/5">
                            <button
                                onClick={() => { onNavigate('attendance'); setActionsOpen(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all"
                            >
                                <UserCheck size={14} strokeWidth={2.5} className="text-primary" /> Check-in
                            </button>
                            <button
                                onClick={() => { onNavigate('members', 'register'); setActionsOpen(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all"
                            >
                                <UserPlus size={14} strokeWidth={2.5} className="text-success" /> New Member
                            </button>
                            <button
                                onClick={() => { onNavigate('expenses'); setActionsOpen(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all"
                            >
                                <Receipt size={14} strokeWidth={2.5} className="text-accent" /> Log Expense
                            </button>
                            <button
                                onClick={() => { onNavigate('finance', 'custom_income'); setActionsOpen(false); }}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all"
                            >
                                <Plus size={14} strokeWidth={3} className="text-success" /> Log Income
                            </button>

                            {/* Nested Generate Report Menu */}
                            <div className="relative group/report">
                                <button className="w-full flex items-center justify-between px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp size={14} strokeWidth={2.5} className="text-primary" /> Generate Report
                                    </div>
                                    <ChevronRight size={12} className="opacity-50 group-hover/report:opacity-100 transition-opacity" />
                                </button>
                                {/* Submenu */}
                                <div className="absolute right-[calc(100%+0.5rem)] top-0 w-48 bg-card border border-text/5 rounded-2xl shadow-xl overflow-hidden invisible opacity-0 translate-x-2 group-hover/report:visible group-hover/report:opacity-100 group-hover/report:translate-x-0 transition-all divide-y divide-text/5">
                                    <button onClick={() => { console.log('PDF'); setActionsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all">
                                        <FileText size={13} strokeWidth={2.5} className="text-error" /> PDF Report
                                    </button>
                                    <button onClick={() => { console.log('Excel'); setActionsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all">
                                        <Download size={13} strokeWidth={2.5} className="text-success" /> Excel Report
                                    </button>
                                    <button onClick={() => { console.log('Email'); setActionsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all">
                                        <Mail size={13} strokeWidth={2.5} className="text-accent" /> Send to Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Theme + Profile — always far right */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 bg-card border border-text/5 rounded-xl shadow-premium text-text/40 hover:text-primary transition-all"
                >
                    {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
                </button>
                <div className="flex items-center gap-2 bg-card pl-3 pr-2 py-1.5 rounded-full border border-text/5 shadow-premium">
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <p className="hidden md:block text-text font-bold text-xs tracking-tight px-1">
                        {(user?.role === 'manager' || user?.role === 'admin') ? 'Manager' : 'Front Desk'}
                    </p>
                    <button
                        onClick={onLogout}
                        className="p-1.5 bg-error/5 text-error hover:bg-error hover:text-white rounded-full transition-all"
                        title="Sign Out"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </header>
    );
}

export function MobileHeader({ user, onLogout }) {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const tabs = getTabsForUser(user);

    return (
        <>
            <header className="fixed lg:hidden top-0 left-0 right-0 h-20 bg-surface/85 backdrop-blur-2xl border-b border-text/5 z-[60] px-5 flex items-center justify-between transition-all">
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="w-11 h-11 rounded-2xl bg-card border border-text/5 shadow-premium text-text/50 flex items-center justify-center"
                    aria-label="Open menu"
                >
                    <Menu size={18} />
                </button>

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <img src={logo} alt="Infinity Gym" className="h-9 w-auto" />
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <button
                        onClick={toggleTheme}
                        className="w-11 h-11 rounded-2xl bg-card border border-text/5 shadow-premium text-text/40 flex items-center justify-center"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </div>
            </header>

            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] isolate">
                    {/* Dark Backdrop Overlay */}
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    
                    {/* Sidebar Drawer */}
                    <aside className="fixed top-0 left-0 bottom-0 w-[82%] max-w-sm bg-surface border-r border-text/5 shadow-[20px_0_60px_rgba(0,0,0,0.15)] p-5 flex flex-col animate-in slide-in-from-left duration-300 overflow-y-auto">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-text/5 relative z-10">
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="Infinity Gym" className="h-9 w-auto" />
                                <div className="overflow-hidden">
                                    <p className="text-text font-black text-[10px] uppercase tracking-[0.2em]">
                                        {(user?.role === 'manager' || user?.role === 'admin') ? 'Manager' : 'Front Desk'}
                                    </p>
                                    <p className="text-text/40 text-[9px] font-bold truncate tracking-widest uppercase">{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-10 h-10 rounded-2xl bg-card border border-text/5 shadow-sm hover:shadow-md text-text/40 hover:text-text hover:bg-surface flex items-center justify-center transition-all"
                                aria-label="Close menu"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <nav className="flex-1 space-y-2 relative z-10 pt-4">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;

                                return (
                                    <NavLink
                                        key={tab.id}
                                        to={tab.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={({ isActive }) => cn(
                                            "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all",
                                            isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[0.98]" : "text-text/50 hover:bg-surface hover:text-text hover:scale-[0.98]"
                                        )}
                                    >
                                        <Icon size={18} strokeWidth={2.5} />
                                        <span className="font-bold text-[11px] uppercase tracking-[0.15em]">{tab.label}</span>
                                    </NavLink>
                                );
                            })}
                        </nav>

                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-error/5 text-error border border-error/10 hover:bg-error hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all mt-6 shadow-sm relative z-10"
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </aside>
                </div>
            )}
        </>
    );
}
