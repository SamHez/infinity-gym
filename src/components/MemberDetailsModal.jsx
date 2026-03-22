import React, { useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, CreditCard, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming utils exists
import { motion } from 'framer-motion';

export function MemberDetailsModal({ member, onClose, onDelete, onEdit }) {
    if (!member) return null;

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleDelete = () => {
        onDelete(member.id);
        // Parent component (MemberList) handles the confirmation modal
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-surface/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-full max-w-lg bg-card border border-text/5 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                {/* Header / Banner */}
                <div className="relative h-32 bg-primary/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-surface/50 hover:bg-surface text-text/60 hover:text-text rounded-full transition-all backdrop-blur-md z-10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 -mt-16 relative">
                    <div className="flex justify-between items-end mb-6">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-surface border-4 border-card shadow-xl flex items-center justify-center text-primary text-5xl font-black overflow-hidden relative">
                            {member.picture_url ? (
                                <img src={member.picture_url} alt={member.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={64} strokeWidth={1.5} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                        <div className="mb-2 text-right">
                            <p className="text-[10px] font-mono font-bold text-primary mb-1 tracking-widest uppercase">{member.member_code || 'NO-CODE'}</p>
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border mb-2 w-fit ml-auto",
                                member.status === 'Active' ? "bg-success/10 text-success border-success/20" :
                                    member.status === 'Expiring Soon' ? "bg-accent/10 text-accent border-accent/20" :
                                        "bg-error/10 text-error border-error/20"
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full",
                                    member.status === 'Active' ? "bg-success" :
                                        member.status === 'Expiring Soon' ? "bg-accent" : "bg-error"
                                )} />
                                {member.status}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-text tracking-tight leading-none mb-1">{member.full_name}</h2>
                            <p className="text-[10px] font-bold text-text/40 uppercase tracking-[0.2em]">{member.category}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-surface/50 rounded-3xl space-y-1">
                                <div className="flex items-center gap-2 text-text/30 mb-2">
                                    <Phone size={14} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Contact</span>
                                </div>
                                <p className="text-sm font-bold text-text truncate">{member.phone || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-surface/50 rounded-3xl space-y-1">
                                <div className="flex items-center gap-2 text-text/30 mb-2">
                                    <Calendar size={14} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Joined</span>
                                </div>
                                <p className="text-sm font-bold text-text truncate">{member.start_date}</p>
                            </div>
                            <div className="p-4 bg-surface/50 rounded-3xl space-y-1">
                                <div className="flex items-center gap-2 text-text/30 mb-2">
                                    <Clock size={14} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Duration</span>
                                </div>
                                <p className="text-sm font-bold text-text truncate">{member.duration}</p>
                            </div>
                            <div className="p-4 bg-surface/50 rounded-3xl space-y-1">
                                <div className="flex items-center gap-2 text-text/30 mb-2">
                                    <AlertCircle size={14} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Expires</span>
                                </div>
                                <p className={cn("text-sm font-bold truncate",
                                    member.status === 'Expired' ? "text-error" : "text-text"
                                )}>{member.expiry_date}</p>
                            </div>
                        </div>

                        {member.email && (
                            <div className="flex items-center gap-3 p-4 border border-text/5 rounded-2xl">
                                <div className="p-2 bg-primary/5 text-primary rounded-xl">
                                    <Mail size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[9px] font-bold text-text/30 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-text truncate">{member.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex gap-4">
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-4 border border-error/20 text-error bg-error/5 hover:bg-error/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                                <AlertCircle size={14} /> Delete Asset
                            </button>
                            <button
                                onClick={() => {
                                    onEdit(member);
                                    onClose();
                                }}
                                className="flex-1 py-4 bg-primary text-white hover:bg-primary-light rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-colors shadow-premium"
                            >
                                Edit Details
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
