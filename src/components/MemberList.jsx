import React, { useState } from 'react';
import { Card } from './Card';
import { Search, Filter, MoreHorizontal, User, ShieldCheck, Plus, Trash2, Eye, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'framer-motion';
import { MemberDetailsModal } from './MemberDetailsModal';
import { useMembers } from '../lib/data-hooks';
import { ConfirmationModal } from './ConfirmationModal';

export function MemberList({ onAddMember, onEditMember }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const { members, loading, deleteMember, stats } = useMembers();
    const [selectedMember, setSelectedMember] = useState(null);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDeleteRequest = (id, e) => {
        if (e) e.stopPropagation();
        setMemberToDelete(id);
        setMenuOpenId(null);
    };

    const handleConfirmDelete = async () => {
        if (!memberToDelete) return;
        setDeleting(true);
        try {
            const success = await deleteMember(memberToDelete);
            if (success) {
                setMemberToDelete(null);
                if (selectedMember?.id === memberToDelete) setSelectedMember(null);
            }
        } catch (err) {
            console.error("Delete Member UI Error:", err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-10" onClick={() => setMenuOpenId(null)}>
            {/* Directory Header */}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-primary text-[11px] font-bold uppercase tracking-[0.4em] mb-2 leading-none">Asset Database</h2>
                    <p className="text-text text-3xl md:text-4xl font-bold tracking-tighter leading-none uppercase">MEMBERS</p>
                </div>

                <button
                    onClick={onAddMember}
                    className="flex items-center gap-3 bg-primary text-white px-8 py-5 rounded-[2.5rem] font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} />
                    Register New
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <Card className="liquid-glass border-none shadow-xl shadow-primary/10">
                    <p className="text-primary/60 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Total Active Base</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-bold tracking-tighter text-text leading-none">{stats?.active || 0}</h3>
                        <span className="text-[10px] font-bold text-text/40 mb-1 ml-2">/ {stats?.total || 0} Total</span>
                    </div>
                </Card>

                <Card>
                    <p className="text-text/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">New This Week</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold tracking-tighter text-text leading-none">{stats?.newThisWeek || 0}</h3>
                        <span className={cn(
                            "text-[11px] font-bold mb-1 ml-2",
                            (stats?.growthPercentage || 0) >= 0 ? "text-success" : "text-error"
                        )}>
                            {(stats?.growthPercentage || 0) >= 0 ? '↑' : '↓'} {Math.abs(stats?.growthPercentage || 0)}%
                        </span>
                    </div>
                </Card>

                <Card>
                    <p className="text-text/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Expiring Soon (7d)</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold tracking-tighter text-text leading-none">{stats?.expiringSoon || 0}</h3>
                        <span className="text-[11px] font-bold text-error mb-1 ml-2">Action needed</span>
                    </div>
                </Card>
            </div>

            {/* Tactical Search Interface */}
            <Card className="p-2 border border-text/5 shadow-premium flex flex-col md:flex-row gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-primary transition-colors w-4 h-4" strokeWidth={2.5} />
                    <input
                        type="text"
                        placeholder="SEARCH MEMBERS BY NAME OR CODE..."
                        className="w-full bg-surface/50 border-none rounded-[1.5rem] py-3 pl-14 pr-6 text-text font-bold text-sm focus:ring-4 focus:ring-primary/10 placeholder:text-text/10 transition-all font-sans uppercase tracking-widest outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-text/20 w-4 h-4 z-10 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-surface/50 border-none rounded-[1.5rem] py-3 pl-14 pr-10 text-text font-bold text-[11px] focus:ring-4 focus:ring-primary/10 transition-all font-sans uppercase tracking-[0.2em] outline-none appearance-none cursor-pointer hover:bg-surface"
                    >
                        <option value="All">All Entities</option>
                        <option value="Active">Active</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
            </Card>

            {/* Grid-based Member Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-2 py-20 flex flex-col items-center justify-center gap-4 text-center text-text/20">
                        <Loader2 size={28} className="animate-spin text-primary" />
                        <div className="font-bold uppercase tracking-[0.5em]">
                            Synchronizing Database...
                        </div>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="col-span-2 py-20 text-center text-text/10 font-bold uppercase tracking-[0.5em]">
                        No Assets Identified in Registry
                    </div>
                ) : filteredMembers.map(member => (
                    <Card
                        key={member.id}
                        className="p-4 pr-4 flex items-center justify-between group hover:border-primary/30 transition-all relative overflow-visible cursor-pointer"
                        onClick={() => setSelectedMember(member)}
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-surface flex items-center justify-center text-text/10 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-700 overflow-hidden border border-text/5">
                                {member.picture_url ? (
                                    <img src={member.picture_url} alt={member.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={24} strokeWidth={2.5} />
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <p className="text-text font-bold text-lg tracking-tighter leading-none">{member.full_name}</p>
                                    {member.status === 'Active' && <ShieldCheck size={16} className="text-success" />}
                                </div>
                                <p className="text-[10px] font-mono font-bold text-primary/60 tracking-tight uppercase">{member.member_code || 'NO-CODE'}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-text/20 uppercase tracking-[0.15em]">{member.category}</span>
                                    <div className="w-1 h-1 bg-text/5 rounded-full" />
                                    <span className={cn(
                                        "text-[9px] font-bold tracking-tight px-2 py-0.5 rounded-lg shadow-sm",
                                        member.status === 'Active' ? "text-success bg-success/10 border border-success/20" :
                                            member.status === 'Expiring Soon' ? "text-accent bg-accent/10 border border-accent/20" : "text-error bg-error/10 border border-error/20"
                                    )}>
                                        {member.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenId(menuOpenId === member.id ? null : member.id);
                                }}
                                className="p-3 text-text/20 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {/* Context Menu */}
                            {menuOpenId === member.id && (
                                <div className="absolute top-12 right-0 w-48 bg-card border border-text/5 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMember(member);
                                            setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-5 py-3 hover:bg-surface text-[10px] font-bold uppercase tracking-widest text-text/60 hover:text-text flex items-center gap-2"
                                    >
                                        <Eye size={14} /> View Details
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteRequest(member.id, e)}
                                        className="w-full text-left px-5 py-3 hover:bg-error/5 text-[10px] font-bold uppercase tracking-widest text-error/60 hover:text-error flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Delete Asset
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Status edge indicator */}
                        <div className={cn(
                            "absolute top-0 right-0 w-1 h-full opacity-0 group-hover:opacity-30 transition-opacity",
                            member.status === 'Active' ? "bg-success" :
                                member.status === 'Expiring Soon' ? "bg-accent" : "bg-error"
                        )} />
                    </Card>
                ))}
            </div>

            {/* Audit Summary Footer */}
            <div className="pt-10 flex flex-col items-center gap-4">
                <div className="h-[2px] w-32 bg-text/[0.03] rounded-full" />
                <p className="text-text/20 font-bold text-xs uppercase tracking-[0.5em] ">
                    Viewing {filteredMembers.length.toLocaleString()} Verified Personnel
                </p>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedMember && (
                    <MemberDetailsModal
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                        onDelete={(id) => setMemberToDelete(id)}
                        onEdit={onEditMember}
                    />
                )}
            </AnimatePresence>
            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={!!memberToDelete}
                onClose={() => setMemberToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Member?"
                message="This will permanently remove this member and all their records from the system. This action cannot be undone."
                confirmText={deleting ? "Deleting..." : "Delete Permanently"}
            />
        </div>
    );
}
