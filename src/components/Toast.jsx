import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export function Toast({ message, type, onClose }) {
    const icons = {
        success: <CheckCircle className="text-success" size={20} />,
        error: <AlertCircle className="text-error" size={20} />,
        info: <Info className="text-primary" size={20} />
    };

    const backgrounds = {
        success: "bg-success/5 border-success/20",
        error: "bg-error/5 border-error/20",
        info: "bg-primary/5 border-primary/20"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
                "pointer-events-auto flex items-center gap-4 p-4 rounded-[1.5rem] border backdrop-blur-xl shadow-2xl",
                backgrounds[type] || backgrounds.info
            )}
        >
            <div className="flex-shrink-0">
                {icons[type] || icons.info}
            </div>

            <p className="flex-1 text-sm font-bold text-text tracking-tight leading-tight">
                {message}
            </p>

            <button
                onClick={onClose}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors text-text/20 hover:text-text"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}
