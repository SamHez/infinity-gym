import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function ConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger" // danger, warning, info
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-surface/40 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-card border border-text/5 rounded-[2.5rem] shadow-3xl overflow-hidden"
                >
                    {/* Header/Banner based on type */}
                    <div className={cn(
                        "h-2 w-full",
                        type === "danger" ? "bg-error" : type === "warning" ? "bg-accent" : "bg-primary"
                    )} />

                    <div className="p-10 space-y-8">
                        <div className="flex items-start gap-6">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg",
                                type === "danger" ? "bg-error/10 text-error" : type === "warning" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                            )}>
                                <AlertTriangle size={28} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight text-text uppercase leading-none">{title}</h3>
                                <p className="text-text/40 text-xs font-medium leading-relaxed uppercase tracking-wider">
                                    {message}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-5 bg-text/5 text-text rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-text/10 transition-all border border-text/5"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await onConfirm();
                                    } catch (err) {
                                        console.error("Confirmation Action Failed:", err);
                                    }
                                    onClose();
                                }}
                                className={cn(
                                    "flex-1 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                                    type === "danger" ? "bg-error shadow-error/20" : type === "warning" ? "bg-accent shadow-accent/20" : "bg-primary shadow-primary/20"
                                )}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 text-text/20 hover:text-text transition-colors"
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
