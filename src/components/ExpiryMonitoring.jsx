import React from 'react';
import { Card } from './Card';
import { AlertTriangle, Clock, Calendar, Mail, Phone, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function ExpiryMonitoring() {
    const expires = [
        { name: 'Emmanuel M.', days: 2, status: 'Critical', category: 'Normal', phone: '078...' },
        { name: 'Divine I.', days: 5, status: 'Warning', category: 'Student', phone: '079...' },
        { name: 'John Doe', days: -1, status: 'Expired', category: 'Resident', phone: '072...' },
    ];

    return (
        <div className="space-y-10">
            {/* Risk Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-error text-[11px] font-black uppercase tracking-[0.4em] mb-2 leading-none ">Asset Risk Analysis</h2>
                    <p className="text-text text-5xl font-black  tracking-tighter leading-none uppercase">MONITOR</p>
                </div>
                <div className="flex items-center gap-4 bg-error/5 border border-error/10 px-8 py-4 rounded-[2rem] text-error font-black text-[10px] uppercase tracking-widest">
                    <AlertTriangle size={16} /> Total 14 High-Priority Renewal Risks
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {expires.map((member, i) => (
                    <Card key={i} className={cn(
                        "p-10 flex flex-col justify-between group transition-all duration-700 relative overflow-hidden",
                        member.status === 'Expired' ? "border-error/30" : "border-text/5"
                    )}>
                        <div className="space-y-8 z-10 relative">
                            <div className="flex justify-between items-start">
                                <div className={cn(
                                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-premium",
                                    member.status === 'Critical' ? "bg-error text-white" :
                                        member.status === 'Expired' ? "bg-text text-white" : "bg-primary text-white"
                                )}>
                                    {member.status === 'Expired' ? <AlertTriangle size={24} strokeWidth={2.5} /> : <Clock size={24} strokeWidth={2.5} />}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest",
                                    member.status === 'Critical' ? "bg-error/10 text-error" :
                                        member.status === 'Expired' ? "bg-text/10 text-text" : "bg-primary/10 text-primary"
                                )}>{member.status}</span>
                            </div>

                            <div>
                                <h4 className="text-3xl font-black tracking-tighter  text-text mb-1 leading-none uppercase">{member.name}</h4>
                                <p className="text-text/20 text-[10px] font-black uppercase tracking-[0.5em] ">Personnel Identification</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-text/30">Gap Analytics</span>
                                    <span className={cn(
                                        " text-lg tracking-tighter",
                                        member.days < 0 ? "text-error" : "text-text"
                                    )}>
                                        {member.days < 0 ? `Terminated ${Math.abs(member.days)}d ago` : `${member.days} Days Remaining`}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-text/5">
                                    <div className={cn(
                                        "h-full rounded-full transition-all duration-1000",
                                        member.status === 'Critical' ? "bg-error" :
                                            member.status === 'Expired' ? "bg-text/40" : "bg-primary"
                                    )} style={{ width: member.days < 0 ? '100%' : `${(member.days / 10) * 100}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-4 z-10 relative">
                            <button className="flex-1 py-4 bg-surface border border-text/5 hover:border-primary/30 rounded-2xl flex items-center justify-center gap-3 text-text/40 hover:text-primary transition-all group/btn">
                                <Phone size={16} className="group-hover/btn:rotate-12 transition-transform" />
                            </button>
                            <button className="flex-[3] py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                                Initiate Renewal <ChevronRight size={14} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Background Texture */}
                        <div className="absolute -bottom-10 -right-10 p-4 opacity-[0.02] rotate-12 group-hover:scale-150 transition-transform duration-[2s]">
                            <Calendar size={180} />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
