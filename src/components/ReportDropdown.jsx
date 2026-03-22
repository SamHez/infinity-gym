import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, ChevronRight, FileText, Download, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { ReportConfigModal } from './ReportConfigModal';
import { ReportService } from '../lib/ReportService';

export function ReportDropdown({ customVariant }) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [reportType, setReportType] = useState('PDF');
    const dropdownRef = useRef(null);
    const { showToast } = useToast();

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAction = (type) => {
        setReportType(type);
        setModalOpen(true);
        setIsOpen(false);
    };

    const executeGeneration = async (type, scope, email) => {
        try {
            if (type === 'PDF') {
                await ReportService.generatePDF(scope);
                showToast('PDF Report generated successfully!', 'success');
            } else if (type === 'Excel') {
                await ReportService.generateExcel(scope);
                showToast('Excel Report generated successfully!', 'success');
            } else if (type === 'Email') {
                await ReportService.sendViaEmailJS(scope, email);
                showToast('Report emailed successfully!', 'success');
            }
        } catch (error) {
            console.error("Report Error:", error);
            showToast('Failed to generate report. Check console.', 'error');
            throw error;
        }
    };

    const isMobileMenu = customVariant === 'mobile-transparent';

    return (
        <div className={cn("relative shrink-0", isMobileMenu && "w-full")} ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={isMobileMenu 
                    ? "w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-card transition-all rounded-xl"
                    : "flex items-center gap-2 bg-text/5 text-text px-5 py-2.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-text/10 transition-all border border-text/5"
                }
            >
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} strokeWidth={isMobileMenu ? 2.5 : 3} className={isMobileMenu ? "text-text" : ""} /> 
                    Generate Report
                </div>
                {isMobileMenu && <ChevronRight size={14} className={cn("transition-transform opacity-50", isOpen && "rotate-90")} />}
            </button>
            
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-text/5 rounded-2xl shadow-xl overflow-hidden z-50 divide-y divide-text/5 animate-in fade-in slide-in-from-top-2">
                    <button 
                        onClick={() => handleAction('PDF')} 
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all"
                    >
                        <FileText size={13} strokeWidth={2.5} className="text-error" /> PDF Report
                    </button>
                    <button 
                        onClick={() => handleAction('Excel')} 
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all"
                    >
                        <Download size={13} strokeWidth={2.5} className="text-success" /> Excel Report
                    </button>
                    <button 
                        onClick={() => handleAction('Email')} 
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text/70 hover:text-text hover:bg-surface transition-all"
                    >
                        <Mail size={13} strokeWidth={2.5} className="text-accent" /> Send to Email
                    </button>
                </div>
            )}

            <ReportConfigModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                type={reportType} 
                onGenerate={executeGeneration} 
            />
        </div>
    );
}
