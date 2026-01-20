import React from 'react';
import { Card } from './Card';
import { User, Calendar, Clock, MapPin, Star, Award, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function TrainersSchedules() {
    const trainers = [
        { name: 'Coach Eric', specialty: 'Bodybuilding & Strength', rating: 4.9, cert: 'Certified Pro', image: 'E' },
        { name: 'Coach Sarah', specialty: 'Cardio & Yoga', rating: 4.8, cert: 'Movement Specialist', image: 'S' },
    ];

    return (
        <div className="space-y-12">
            {/* Elite Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-accent text-[11px] font-black uppercase tracking-[0.5em] mb-2 leading-none ">Elite Talent Matrix</h2>
                    <p className="text-text text-5xl font-black  tracking-tighter leading-none uppercase">ACADEMY</p>
                </div>
                <div className="hidden md:block">
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-surface bg-primary text-white flex items-center justify-center font-black text-xs z-10 transition-transform hover:-translate-y-2 cursor-pointer shadow-premium">
                                {i}
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-surface bg-accent text-white flex items-center justify-center font-black text-xs z-0 shadow-premium">+12</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div className="flex items-center gap-4 ml-4">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <p className="text-text/20 text-[11px] font-black uppercase tracking-[0.4em] ">Active Coaching Roster</p>
                    </div>

                    {trainers.map((coach, i) => (
                        <Card key={i} className="p-8 group hover:border-accent/30 transition-all cursor-pointer relative overflow-hidden">
                            <div className="flex items-center gap-10 relative z-10">
                                <div className="w-28 h-28 rounded-[3rem] bg-surface flex items-center justify-center text-primary font-black text-5xl  border border-text/5 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-inner">
                                    {coach.image}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-text font-black text-4xl tracking-tighter  leading-none truncate uppercase">{coach.name}</h3>
                                        <div className="flex items-center gap-1 text-accent">
                                            <Star size={16} fill="currentColor" />
                                            <span className="text-sm font-black  tracking-tighter">{coach.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-accent text-[11px] font-black uppercase tracking-[0.3em] ">{coach.specialty}</p>
                                    <div className="flex items-center gap-3 pt-2">
                                        <Award size={18} className="text-text/30" />
                                        <span className="text-text/30 text-[10px] font-black uppercase tracking-widest">{coach.cert}</span>
                                    </div>
                                </div>
                                <button className="ml-auto p-5 bg-surface rounded-3xl text-text/10 group-hover:text-accent group-hover:bg-accent/5 transition-all">
                                    <ChevronRight size={28} strokeWidth={3} />
                                </button>
                            </div>

                            {/* Decorative Pattern */}
                            <div className="absolute -bottom-6 -right-6 opacity-[0.02] rotate-45 group-hover:scale-150 transition-transform duration-[2s]">
                                <Award size={160} />
                            </div>
                        </Card>
                    ))}

                    <button className="w-full py-6 bg-surface border-2 border-dashed border-text/10 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.5em] text-text/20 hover:text-accent hover:border-accent/20 transition-all ">
                        Recruit Elite Talent
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-4 ml-4">
                        <div className="w-2 h-2 bg-text/20 rounded-full" />
                        <p className="text-text/20 text-[11px] font-black uppercase tracking-[0.4em] ">Facility Schedule Matrix</p>
                    </div>

                    <Card className="p-10 space-y-10">
                        <div className="flex justify-between items-center pb-8 border-b border-text/5">
                            <div className="flex items-center gap-4">
                                <Calendar className="text-accent" size={24} />
                                <span className="text-text font-black text-xl  tracking-tighter">Operational Week</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text/20">GMT +02:00</span>
                        </div>

                        <div className="space-y-8">
                            {[
                                { day: 'Mon - Fri', hours: '05:30 - 22:00', load: 85 },
                                { day: 'Saturday', hours: '06:30 - 21:00', load: 45 },
                                { day: 'Sunday', hours: '08:00 - 18:00', load: 20 },
                            ].map(slot => (
                                <div key={slot.day} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-text font-black text-lg tracking-tight leading-none uppercase ">{slot.day}</p>
                                        <div className="flex items-center gap-3">
                                            <Clock size={12} className="text-text/20" />
                                            <p className="text-text/30 text-[10px] font-black uppercase tracking-widest">{slot.hours}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="h-1.5 w-24 bg-surface rounded-full overflow-hidden border border-text/5">
                                            <div className={cn("h-full rounded-full bg-accent", slot.load > 70 ? "bg-error" : "bg-accent")} style={{ width: `${slot.load}%` }} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-text/10">Projected Vol: {slot.load}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 mt-8 border-t border-text/5 space-y-4">
                            <div className="flex items-center gap-4 text-text/40">
                                <MapPin size={18} className="text-accent" />
                                <p className="text-xs font-medium ">Infinity Hotel, MG 3rd Floor - Kigali, Rwanda</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
