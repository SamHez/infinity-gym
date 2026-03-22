import React, { useState } from 'react';
import { Calendar, FileText, Download, Mail, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function ReportConfigModal({ isOpen, onClose, onGenerate, type }) {
    const [scope, setScope] = useState('7d'); // '1d' | '7d' | '1m'
    const [email, setEmail] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const getIcon = () => {
        if (type === 'PDF') return <FileText size={24} className="text-error" />;
        if (type === 'Excel') return <Download size={24} className="text-success" />;
        if (type === 'Email') return <Mail size={24} className="text-accent" />;
        return <FileText size={24} />;
    };

    const handleConfirm = async () => {
        if (type === 'Email' && !email) {
            alert('Please enter a recipient email address.');
            return;
        }
        setIsGenerating(true);
        try {
            await onGenerate(type, scope, email);
            onClose();
        } catch (error) {
            console.error("Report Generation Error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-text/10 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in">
                {/* Header */}
                <div className="p-6 pb-4 flex items-center gap-4 border-b border-text/5">
                    <div className="flex-shrink-0 bg-surface p-3 rounded-2xl">
                        {getIcon()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tighter text-text">Generate {type}</h2>
                        <p className="text-text/50 text-[10px] font-bold uppercase tracking-widest mt-1">Select timeframe</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-text/40 hover:text-text hover:bg-surface p-2 rounded-xl transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <button
                        onClick={() => setScope('1d')}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                            scope === '1d' ? "border-primary bg-primary/5 text-primary" : "border-text/5 bg-surface text-text/70 hover:border-text/10 hover:text-text"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Calendar size={16} />
                            <span className="font-bold tracking-tight text-sm">Daily Report</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest opacity-60">Today</span>
                    </button>

                    <button
                        onClick={() => setScope('7d')}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                            scope === '7d' ? "border-primary bg-primary/5 text-primary" : "border-text/5 bg-surface text-text/70 hover:border-text/10 hover:text-text"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Calendar size={16} />
                            <span className="font-bold tracking-tight text-sm">7-Day Report</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest opacity-60">Past Week</span>
                    </button>

                    <button
                        onClick={() => setScope('1m')}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                            scope === '1m' ? "border-primary bg-primary/5 text-primary" : "border-text/5 bg-surface text-text/70 hover:border-text/10 hover:text-text"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Calendar size={16} />
                            <span className="font-bold tracking-tight text-sm">Monthly Report</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest opacity-60">Past 30 Days</span>
                    </button>
                </div>

                {type === 'Email' && (
                    <div className="px-6 pb-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text/60 mb-2 block">Recipient Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="manager@infinitygym.rw"
                            className="w-full bg-surface border border-text/10 text-text text-sm rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 bg-surface border-t border-text/5 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-text/60 hover:bg-text/5 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isGenerating}
                        className="flex-[2] flex justify-center items-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isGenerating ? (
                            <><Loader2 size={14} className="animate-spin" /> Generating...</>
                        ) : (
                            <>Generate & Export</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
