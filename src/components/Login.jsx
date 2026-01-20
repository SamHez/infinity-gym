import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import logo from '../assets/logo.png';
import { supabase } from '../lib/supabase';

export function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { theme, toggleTheme } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Fetch user profile for role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            setError("Profile not found. Please contact admin.");
            setLoading(false);
            return;
        }

        onLogin({ email: data.user.email, role: profile.role.toLowerCase() });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-500">
            {/* Decorative Elements */}
            <div className="absolute top-[-5%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-8 right-8 p-3 bg-card border border-text/5 rounded-2xl shadow-premium text-text/60 hover:text-accent transition-all"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="w-full max-w-md z-10 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                    <div className="inline-block p-4 bg-card rounded-3xl shadow-premium mb-8 border border-text/5">
                        <img src={logo} alt="Infinity Gym" className="h-14 w-auto" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-text mb-2 font-sans">
                        INFINITY <span className="text-accent">GYM</span>
                    </h1>
                    <p className="text-text/40 font-bold uppercase tracking-[0.3em] text-[10px]">Management Suite</p>
                </div>

                {error && (
                    <div className="bg-error/10 border border-error/20 p-4 rounded-2xl text-error text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in zoom-in duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text/30 uppercase tracking-widest ml-2">Secure Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-accent transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="manager@infinityhotel.rw"
                                className="glass-input w-full py-5 pl-14 pr-4 rounded-2xl font-bold"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text/30 uppercase tracking-widest ml-2">Personnel Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-accent transition-colors" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="glass-input w-full py-5 pl-14 pr-4 rounded-2xl font-bold"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-premium flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] disabled:opacity-50 mt-10"
                    >
                        {loading ? (
                            <Activity className="animate-spin" size={20} />
                        ) : (
                            <>
                                Confirm Access <ChevronRight size={20} strokeWidth={3} />
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-10 text-center">
                    <p className="text-text/20 text-[10px] font-black uppercase tracking-[0.3em]">
                        Infinity Hotel Group Proprietary System
                    </p>
                </div>
            </div>
        </div>
    );
}
