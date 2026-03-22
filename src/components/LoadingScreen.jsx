import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

export function LoadingScreen({ message = "Initializing System" }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                // Faster at start, slower at end for a more "natural" feel
                const increment = Math.max(1, Math.floor((100 - prev) / 10));
                return Math.min(100, prev + increment);
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent/[0.05] rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
                {/* Icon/Logo Placeholder */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-20 h-20 rounded-[2rem] bg-card border border-text/5 flex items-center justify-center shadow-2xl mb-12 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <Activity className="text-primary relative z-10" size={32} strokeWidth={2.5} />
                    <motion.div 
                        className="absolute inset-0 border-2 border-primary/20 rounded-[2rem]"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4 w-full"
                >
                    <h2 className="text-text/20 text-[10px] font-black uppercase tracking-[0.6em] leading-none mb-8">
                        {message}...
                    </h2>

                    {/* Percentage Display */}
                    <div className="relative mb-2">
                        <span className="text-6xl font-black tracking-tighter text-text tabular-nums leading-none">
                            {progress}
                            <span className="text-primary text-2xl ml-1">%</span>
                        </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-1.5 bg-text/[0.03] rounded-full overflow-hidden border border-text/[0.02] relative shadow-inner">
                        <motion.div 
                            className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "easeOut", duration: 0.2 }}
                        />
                    </div>

                    {/* Subtext */}
                    <div className="pt-8 flex items-center justify-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
                        <span className="text-text/30 text-[9px] font-bold uppercase tracking-widest">
                            Secure Handshake Established
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Branding */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-12 flex items-center gap-3 opacity-20"
            >
                <div className="w-6 h-[1px] bg-text" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Infinity Gym OS</span>
                <div className="w-6 h-[1px] bg-text" />
            </motion.div>
        </div>
    );
}
