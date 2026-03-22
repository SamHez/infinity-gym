import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CircleDollarSign, Smartphone, Wallet, Droplets, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function IncomeModal({ isOpen, onClose, onConfirm, initialType = 'Selling Water' }) {
    const [income, setIncome] = useState({
        amount: '',
        category: initialType,
        description: '',
        payment_method: 'Cash'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['Selling Water', 'Custom Income', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!income.amount || !income.category) return;

        setIsSubmitting(true);
        const success = await onConfirm({
            ...income,
            amount: Number(income.amount)
        });

        if (success) {
            onClose();
            setIncome({ amount: '', category: initialType, description: '', payment_method: 'Cash' });
        }
        setIsSubmitting(false);
    };

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
                    className="relative w-full max-w-xl bg-card border border-text/5 rounded-[3rem] shadow-3xl overflow-hidden"
                >
                    <div className="h-2 w-full bg-success" />

                    <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        {/* Header */}
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[2rem] bg-success/10 text-success flex items-center justify-center shadow-lg">
                                <Plus size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold tracking-tighter text-text uppercase leading-none mb-2">Record Income</h3>
                                <p className="text-text/30 text-[10px] font-bold uppercase tracking-[0.3em]">Manual Revenue Entry</p>
                            </div>
                        </div>

                        {/* Amount Section */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2">Transaction Amount (RWF)</label>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text/10 font-black text-xl">RWF</div>
                                <input
                                    type="number"
                                    required
                                    autoFocus
                                    className="w-full bg-text/[0.03] border border-text/5 rounded-3xl py-8 pl-20 pr-8 text-4xl font-black tracking-tighter focus:outline-none focus:border-success/40 focus:bg-white transition-all shadow-inner text-text"
                                    placeholder="0"
                                    value={income.amount}
                                    onChange={(e) => setIncome({ ...income, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Category & Method Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2">Income Source</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20">
                                        {income.category === 'Selling Water' ? <Droplets size={16} /> : <Plus size={16} />}
                                    </div>
                                    <select
                                        className="w-full bg-text/[0.03] border border-text/5 rounded-2xl py-5 pl-12 pr-6 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-success/40 focus:bg-white transition-all text-text/80"
                                        value={income.category}
                                        onChange={(e) => setIncome({ ...income, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2">Payment Method</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20">
                                        {income.payment_method === 'Cash' ? <Wallet size={16} /> : <Smartphone size={16} />}
                                    </div>
                                    <select
                                        className="w-full bg-text/[0.03] border border-text/5 rounded-2xl py-5 pl-12 pr-6 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-success/40 focus:bg-white transition-all text-text/80"
                                        value={income.payment_method}
                                        onChange={(e) => setIncome({ ...income, payment_method: e.target.value })}
                                    >
                                        <option value="Cash">CASH SETTLEMENT</option>
                                        <option value="Mobile Money">MOBILE MONEY</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2">Notes & Details</label>
                            <textarea
                                className="w-full bg-text/[0.03] border border-text/5 rounded-[2rem] py-6 px-8 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-success/40 focus:bg-white transition-all h-24 placeholder:text-text/10"
                                placeholder="Describe the income source (e.g. 5x 500ml Water bottles)..."
                                value={income.description}
                                onChange={(e) => setIncome({ ...income, description: e.target.value })}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-6 bg-text/5 text-text rounded-[2rem] font-bold uppercase tracking-widest text-[10px] hover:bg-text/10 transition-all border border-text/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !income.amount}
                                className="flex-[2] py-6 bg-success text-white rounded-[2rem] font-bold uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-success/20 disabled:opacity-50 disabled:grayscale"
                            >
                                {isSubmitting ? "Syncing..." : "Confirm Income Entry"}
                            </button>
                        </div>
                    </form>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-text/20 hover:text-text transition-colors"
                    >
                        <X size={24} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
