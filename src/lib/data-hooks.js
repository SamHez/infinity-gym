import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMembers() {
            setLoading(true);
            const { data, error } = await supabase
                .from('members')
                .select('*');

            if (error) {
                console.error("Supabase Fetch Error (Members):", error);
            }
            if (data) {
                console.log("Supabase Fetch Success (Members):", data.length, "records");
                setMembers(data);
            }
            setLoading(false);
        }
        fetchMembers();
    }, []);

    return { members, loading };
}

export function useAttendance() {
    const [todayCount, setTodayCount] = useState(0);
    const [checkedInIds, setCheckedInIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAttendance() {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('attendance')
                .select('member_id')
                .eq('attendance_date', today);

            if (data) {
                setCheckedInIds(data.map(a => a.member_id));
                setTodayCount(data.length);
            }
            setLoading(false);
        }
        fetchAttendance();
    }, []);

    const checkIn = async (memberId) => {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
            .from('attendance')
            .insert([{ member_id: memberId, attendance_date: today }]);

        if (!error) {
            setTodayCount(prev => prev + 1);
            setCheckedInIds(prev => [...prev, memberId]);
            return true;
        }
        return false;
    };

    const removeCheckIn = async (memberId) => {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('member_id', memberId)
            .eq('attendance_date', today);

        if (!error) {
            setTodayCount(prev => Math.max(0, prev - 1));
            setCheckedInIds(prev => prev.filter(id => id !== memberId));
            return true;
        }
        return false;
    };

    return { todayCount, checkedInIds, checkIn, removeCheckIn, loading };
}

export function useFinance() {
    const [stats, setStats] = useState({ revenue: 0, transactions: 0, breakdown: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFinance() {
            setLoading(true);
            const { data, error } = await supabase
                .from('payments')
                .select('*');

            if (data) {
                const total = data.reduce((sum, p) => sum + Number(p.amount), 0);

                // Calculate monthly stats for the last 10 months
                const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                const monthlyData = new Array(10).fill(0).map((_, i) => {
                    const date = new Date();
                    date.setDate(1); // Set to 1st to avoid end-of-month overflow issues
                    date.setMonth(date.getMonth() - (9 - i));
                    const monthIndex = date.getMonth();
                    const year = date.getFullYear();

                    const monthRevenue = data
                        .filter(p => {
                            if (!p.transaction_date) return false;
                            const pDate = new Date(p.transaction_date);
                            return pDate.getUTCMonth() === monthIndex && pDate.getUTCFullYear() === year;
                        })
                        .reduce((sum, p) => sum + Number(p.amount), 0);

                    return {
                        month: months[monthIndex],
                        revenue: monthRevenue / 1000 // In 'k'
                    };
                });

                // Calculate method stats
                const mobileRevenue = data
                    .filter(p => p.payment_method === 'Mobile Money')
                    .reduce((sum, p) => sum + Number(p.amount), 0);
                const cashRevenue = data
                    .filter(p => p.payment_method === 'Cash')
                    .reduce((sum, p) => sum + Number(p.amount), 0);

                setStats({
                    revenue: total,
                    transactions: data.length,
                    monthlyData,
                    mobileRevenue,
                    cashRevenue
                });
            }
            setLoading(false);
        }
        fetchFinance();
    }, []);

    return { stats, loading };
}
