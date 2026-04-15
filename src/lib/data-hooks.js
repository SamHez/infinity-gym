import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useToast } from '../context/ToastContext';

const MEMBER_FIELDS = `
    id,
    member_code,
    branch_code,
    full_name,
    phone,
    email,
    category,
    duration,
    start_date,
    expiry_date,
    status,
    picture_url,
    created_at
`;

const DEFAULT_MEMBERS_CACHE_TTL = 60 * 1000;
const DEFAULT_COUNT_CACHE_TTL = 30 * 1000;

let membersListCache = null;
let membersListCacheAt = 0;
const memberCountCache = new Map();

function getCountCacheKey(status) {
    return status || '__all__';
}

function isFresh(timestamp, ttl) {
    return Date.now() - timestamp < ttl;
}

function updateMembersListCache(members) {
    membersListCache = members;
    membersListCacheAt = Date.now();
    memberCountCache.set(getCountCacheKey(), {
        value: members.length,
        at: Date.now(),
    });
}

function getCachedCount(status) {
    return memberCountCache.get(getCountCacheKey(status));
}

function updateMemberCountCache(count, status) {
    memberCountCache.set(getCountCacheKey(status), {
        value: count,
        at: Date.now(),
    });
}

function decrementMemberCaches(deletedId) {
    if (Array.isArray(membersListCache)) {
        membersListCache = membersListCache.filter((member) => member.id !== deletedId);
        membersListCacheAt = Date.now();
        updateMemberCountCache(membersListCache.length);
    } else {
        const totalCountCache = getCachedCount();
        if (totalCountCache) {
            updateMemberCountCache(Math.max(0, totalCountCache.value - 1));
        }
    }
}

export function useMembers(options = {}) {
    const { showToast } = useToast();
    const {
        countOnly = false,
        search = '',
        status,
        limit,
        enabled = true,
    } = options;

    const normalizedSearch = search.trim();
    const isSearchQuery = normalizedSearch.length > 0;
    const canUseListCache = !countOnly && !isSearchQuery && enabled;
    const canUseCountCache = countOnly && !isSearchQuery && !status && enabled;
    const cachedCountEntry = canUseCountCache ? getCachedCount(status) : null;

    const [members, setMembers] = useState(() => (
        canUseListCache && isFresh(membersListCacheAt, DEFAULT_MEMBERS_CACHE_TTL)
            ? membersListCache
            : []
    ));
    const [count, setCount] = useState(() => (
        cachedCountEntry && isFresh(cachedCountEntry.at, DEFAULT_COUNT_CACHE_TTL)
            ? cachedCountEntry.value ?? 0
            : 0
    ));
    const [loading, setLoading] = useState(() => {
        if (!enabled) return false;
        if (canUseListCache && isFresh(membersListCacheAt, DEFAULT_MEMBERS_CACHE_TTL)) return false;
        if (cachedCountEntry && isFresh(cachedCountEntry.at, DEFAULT_COUNT_CACHE_TTL)) return false;
        return true;
    });

    const [stats, setStats] = useState({
        total: 0,
        newThisWeek: 0,
        expiringSoon: 0,
        active: 0,
        expired: 0,
        growthPercentage: 0
    });

    const fetchMembers = useCallback(async ({ force = false } = {}) => {
        if (!enabled) {
            setLoading(false);
            if (!countOnly) setMembers([]);
            return countOnly ? 0 : [];
        }

        if (countOnly) {
            const nextCachedCountEntry = getCachedCount(status);
            if (!force && nextCachedCountEntry && isFresh(nextCachedCountEntry.at, DEFAULT_COUNT_CACHE_TTL)) {
                setCount(nextCachedCountEntry.value ?? 0);
                setLoading(false);
                return nextCachedCountEntry.value ?? 0;
            }

            setLoading(true);
            let countQuery = supabase
                .from('members')
                .select('id', { count: 'exact', head: true });

            if (status) {
                countQuery = countQuery.eq('status', status);
            }

            const { count: nextCount, error } = await countQuery;

            if (error) {
                console.error("Supabase Fetch Error (Members Count):", error);
                setLoading(false);
                return 0;
            }

            const resolvedCount = nextCount ?? 0;
            setCount(resolvedCount);
            if (!isSearchQuery) {
                updateMemberCountCache(resolvedCount, status);
            }
            setLoading(false);
            return resolvedCount;
        }

        if (!force && !isSearchQuery && isFresh(membersListCacheAt, DEFAULT_MEMBERS_CACHE_TTL)) {
            setMembers(membersListCache ?? []);
            setLoading(false);
            return membersListCache ?? [];
        }

        setLoading(true);
        let query = supabase
            .from('members')
            .select(MEMBER_FIELDS)
            .order('created_at', { ascending: false });

        if (isSearchQuery) {
            query = query.or(`full_name.ilike.%${normalizedSearch}%,phone.ilike.%${normalizedSearch}%`);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (typeof limit === 'number') {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase Fetch Error (Members):", error);
            setLoading(false);
            return [];
        }

        if (data) {
            // Reconcile Statuses locally for immediate UI update
            const today = new Date().toISOString().split('T')[0];
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

            let reconciliations = [];
            const reconciledData = data.map(m => {
                let newStatus = m.status;
                if (m.expiry_date < today && m.status !== 'Expired') newStatus = 'Expired';
                else if (m.expiry_date >= today && m.expiry_date <= sevenDaysStr && m.status !== 'Expiring Soon') newStatus = 'Expiring Soon';
                else if (m.expiry_date > sevenDaysStr && m.status !== 'Active') newStatus = 'Active';

                if (newStatus !== m.status) {
                    reconciliations.push({ id: m.id, status: newStatus });
                    return { ...m, status: newStatus };
                }
                return m;
            });

            // Fire and forget individual or batch updates in background if needed
            if (reconciliations.length > 0) {
                const expiredIds = reconciliations.filter(r => r.status === 'Expired').map(r => r.id);
                const expiringSoonIds = reconciliations.filter(r => r.status === 'Expiring Soon').map(r => r.id);
                const activeIds = reconciliations.filter(r => r.status === 'Active').map(r => r.id);

                Promise.all([
                    expiredIds.length > 0 && supabase.from('members').update({ status: 'Expired' }).in('id', expiredIds),
                    expiringSoonIds.length > 0 && supabase.from('members').update({ status: 'Expiring Soon' }).in('id', expiringSoonIds),
                    activeIds.length > 0 && supabase.from('members').update({ status: 'Active' }).in('id', activeIds)
                ]).catch(err => console.error("Background Reconciliation Error:", err));
            }

            const activeData = reconciledData;

            // Calculate Stats for Summary Cards
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

            const weekAgoStr = weekAgo.toISOString();
            const twoWeeksAgoStr = twoWeeksAgo.toISOString();

            const newThisWeekCount = data.filter(m => m.created_at >= weekAgoStr).length;
            const newLastWeekCount = data.filter(m => m.created_at >= twoWeeksAgoStr && m.created_at < weekAgoStr).length;

            const growthPercentage = newLastWeekCount > 0
                ? Math.round(((newThisWeekCount - newLastWeekCount) / newLastWeekCount) * 100)
                : (newThisWeekCount > 0 ? 100 : 0);

            const expiringSoonCount = data.filter(m => m.status === 'Expiring Soon').length;
            const activeCount = data.filter(m => m.status === 'Active').length;
            const expiredCount = data.filter(m => m.status === 'Expired').length;

            setMembers(data);
            setStats({
                total: data.length,
                newThisWeek: newThisWeekCount,
                expiringSoon: expiringSoonCount,
                active: activeCount,
                expired: expiredCount,
                growthPercentage
            });

            if (!isSearchQuery) {
                updateMembersListCache(data);
            }
        }
        setLoading(false);
        return data ?? [];
    }, [countOnly, enabled, isSearchQuery, limit, normalizedSearch, status]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const deleteMember = async (id) => {
        try {
            console.log(`[useMembers] Initiating robust delete for member: ${id}`);
            
            // 1. Delete dependent Attendance records
            const { error: attendanceError, count: attCount } = await supabase
                .from('attendance')
                .delete({ count: 'exact' })
                .eq('member_id', id);
            
            if (attendanceError) {
                console.warn("[useMembers] Attendance deletion error:", attendanceError);
            } else {
                console.log(`[useMembers] Deleted ${attCount || 0} attendance records.`);
            }

            // 2. Delete dependent Payment records
            const { error: paymentsError, count: payCount } = await supabase
                .from('payments')
                .delete({ count: 'exact' })
                .eq('member_id', id);
            
            if (paymentsError) {
                console.warn("[useMembers] Payments deletion error:", paymentsError);
            } else {
                console.log(`[useMembers] Deleted ${payCount || 0} payment records.`);
            }

            // 3. Delete the Member record with verification
            const { data: deletedData, error, count: memberCount } = await supabase
                .from('members')
                .delete({ count: 'exact' })
                .eq('id', id)
                .select();

            if (error) throw error;
            
            if (!deletedData || deletedData.length === 0) {
                console.error("[useMembers] Deletion failed: No rows affected. Check RLS policies or if record exists.");
                throw new Error("Deletion blocked by system policies or record not found.");
            }

            console.log(`[useMembers] Successfully deleted member record from database.`);
            showToast("Member and all related records deleted", "success");
            
            setMembers(prev => prev.filter(m => m.id !== id));
            decrementMemberCaches(id);
            fetchMembers({ force: true }); // Sync with server count/etc
            return true;
        } catch (err) {
            console.error("[useMembers] Delete Failed:", err.message || err);
            showToast(err.message || "Failed to delete member", "error");
            return false;
        }
    };


    return {
        members,
        stats,
        count,
        loading,
        deleteMember,
        refresh: (force = true) => fetchMembers({ force }),
    };
}

export function useMemberDistribution() {
    const [distribution, setDistribution] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDistribution = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('members')
            .select('category');

        if (data) {
            const counts = data.reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + 1;
                return acc;
            }, {});

            const total = data.length;
            const distro = Object.entries(counts).map(([name, count]) => ({
                name,
                count,
                percent: total > 0 ? (count / total) * 100 : 0
            })).sort((a, b) => b.count - a.count);

            setDistribution(distro);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDistribution();
    }, [fetchDistribution]);

    return { distribution, loading, refresh: fetchDistribution };
}

// --- Attendance Cache ---
const ATTENDANCE_CACHE_TTL = 60 * 1000;
let attendanceCache = null;
let attendanceCacheAt = 0;

export function useAttendance() {
    const [todayCount, setTodayCount] = useState(() => attendanceCache?.todayCount ?? 0);
    const [checkedInIds, setCheckedInIds] = useState(() => attendanceCache?.checkedInIds ?? []);
    const [historicalData, setHistoricalData] = useState([]);
    const [loading, setLoading] = useState(() => !attendanceCache || !isFresh(attendanceCacheAt, ATTENDANCE_CACHE_TTL));
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchAttendance = useCallback(async ({ force = false } = {}) => {
        if (!force && attendanceCache && isFresh(attendanceCacheAt, ATTENDANCE_CACHE_TTL)) {
            setTodayCount(attendanceCache.todayCount);
            setCheckedInIds(attendanceCache.checkedInIds);
            setLoading(false);
            return;
        }
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('attendance')
            .select('member_id')
            .eq('attendance_date', today);

        if (data) {
            const ids = data.map(a => a.member_id);
            setCheckedInIds(ids);
            setTodayCount(data.length);
            attendanceCache = { todayCount: data.length, checkedInIds: ids };
            attendanceCacheAt = Date.now();
        }
        setLoading(false);
    }, []);

    const fetchHistory = useCallback(async (range = '7d') => {
        setLoadingHistory(true);
        const days = range === '7d' ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('attendance')
            .select('attendance_date, check_in_time')
            .gte('attendance_date', startDate.toISOString().split('T')[0])
            .order('attendance_date', { ascending: true });

        if (data) {
            // Aggregate daily counts
            const dailyMap = {};
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const label = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
                dailyMap[dateStr] = { label, count: 0, date: dateStr };
            }

            data.forEach(entry => {
                if (dailyMap[entry.attendance_date]) {
                    dailyMap[entry.attendance_date].count++;
                }
            });

            // Peak hours analysis (simplified)
            const hourMap = {};
            data.forEach(entry => {
                const hour = new Date(entry.check_in_time).getHours();
                hourMap[hour] = (hourMap[hour] || 0) + 1;
            });

            const sortedHours = Object.entries(hourMap).sort((a, b) => b[1] - a[1]);
            const peakHour = sortedHours[0] ? `${sortedHours[0][0]}:00` : 'N/A';

            // Peak Day Analysis
            const sortedDays = Object.values(dailyMap).sort((a, b) => b.count - a.count);
            let peakDay = 'N/A';
            if (sortedDays[0]?.count > 0) {
                const pd = new Date(sortedDays[0].date);
                const dayName = pd.toLocaleDateString('en-US', { weekday: 'short' });
                const monthName = pd.toLocaleDateString('en-US', { month: 'short' });
                const d = pd.getDate();
                const suffix = ["th", "st", "nd", "rd"][(d % 10 > 3 || Math.floor(d % 100 / 10) === 1) ? 0 : d % 10];
                peakDay = `${d}${suffix} ${dayName}`;
            }

            // Average Daily Attendance
            const avgDaily = Math.round(data.length / days);

            // Today vs Yesterday Velocity
            const todayDateStr = new Date().toISOString().split('T')[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayDateStr = yesterday.toISOString().split('T')[0];
            const todayCountVal = dailyMap[todayDateStr]?.count || 0;
            const yesterdayCountVal = dailyMap[yesterdayDateStr]?.count || 0;
            const growth = yesterdayCountVal > 0
                ? Math.round(((todayCountVal - yesterdayCountVal) / yesterdayCountVal) * 100)
                : (todayCountVal > 0 ? 100 : 0);

            setHistoricalData({
                daily: Object.values(dailyMap),
                peakHour,
                peakDay,
                avgDaily,
                yesterdayCount: yesterdayCountVal,
                total: data.length
            });
        }
        setLoadingHistory(false);
    }, []);

    const liveGrowth = (() => {
        const yesterdayCount = historicalData?.yesterdayCount || 0;
        if (yesterdayCount > 0) {
            return Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
        }
        return todayCount > 0 ? 100 : 0;
    })();

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const checkIn = async (memberId) => {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
            .from('attendance')
            .insert([{ member_id: memberId, attendance_date: today }]);

        if (!error) {
            setTodayCount(prev => prev + 1);
            setCheckedInIds(prev => {
                const next = [...prev, memberId];
                if (attendanceCache) attendanceCache = { todayCount: attendanceCache.todayCount + 1, checkedInIds: next };
                return next;
            });
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
            setCheckedInIds(prev => {
                const next = prev.filter(id => id !== memberId);
                if (attendanceCache) attendanceCache = { todayCount: Math.max(0, attendanceCache.todayCount - 1), checkedInIds: next };
                return next;
            });
            return true;
        }
        return false;
    };

    return {
        todayCount,
        checkedInIds,
        historicalData,
        liveGrowth,
        loading,
        loadingHistory,
        checkIn,
        removeCheckIn,
        fetchHistory,
        refresh: () => fetchAttendance({ force: true })
    };
}

// --- Expenses Cache ---
const EXPENSES_CACHE_TTL = 120 * 1000;
let expensesCache = null;
let expensesCacheAt = 0;

export function useExpenses() {
    const { showToast } = useToast();
    const [expenses, setExpenses] = useState(() => expensesCache ?? []);
    const [loading, setLoading] = useState(() => !expensesCache || !isFresh(expensesCacheAt, EXPENSES_CACHE_TTL));

    const fetchExpenses = useCallback(async ({ force = false } = {}) => {
        if (!force && expensesCache && isFresh(expensesCacheAt, EXPENSES_CACHE_TTL)) {
            setExpenses(expensesCache);
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false });

        if (data) {
            setExpenses(data);
            expensesCache = data;
            expensesCacheAt = Date.now();
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addExpense = async (expense) => {
        const { data: userData } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('expenses')
            .insert([{ ...expense, recorded_by: userData.user?.id }])
            .select();

        if (!error && data) {
            setExpenses(prev => {
                const next = [data[0], ...prev];
                expensesCache = next;
                expensesCacheAt = Date.now();
                return next;
            });
            // Update finance cache to reflect new expense
            if (financeCache) {
                financeCache = {
                    ...financeCache,
                    expenses: (financeCache.expenses || 0) + Number(expense.amount),
                    netProfit: (financeCache.netProfit || 0) - Number(expense.amount)
                };
            }
            return true;
        }
        return false;
    };

    const deleteExpense = async (id) => {
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast("Expense record deleted", "success");
            setExpenses(prev => {
                const deletedExpense = prev.find(e => e.id === id);
                const next = prev.filter(e => e.id !== id);
                expensesCache = next;
                expensesCacheAt = Date.now();

                // Update finance cache
                if (financeCache && deletedExpense) {
                    financeCache = {
                        ...financeCache,
                        expenses: Math.max(0, (financeCache.expenses || 0) - Number(deletedExpense.amount)),
                        netProfit: (financeCache.netProfit || 0) + Number(deletedExpense.amount)
                    };
                }
                return next;
            });
            fetchExpenses({ force: true }); // Force re-fetch of finance stats and ledger
            return true;
        } catch (err) {
            console.error("[useExpenses] Delete Failed:", err.message || err);
            showToast(err.message || "Failed to delete expense", "error");
            return false;
        }
    };

    return { expenses, loading, addExpense, deleteExpense, refresh: () => fetchExpenses({ force: true }) };
}

// --- Finance Cache ---
const FINANCE_CACHE_TTL = 120 * 1000;
let financeCache = null;
let financeCacheAt = 0;

export function useFinance() {
    const [stats, setStats] = useState({
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        transactions: 0,
        mobileRevenue: 0,
        cashRevenue: 0,
        todayRevenue: 0,
        todayExpenses: 0,
        monthlyData: [],
        dailyData: [],
        expenseCategories: {},
        expenseBreakdown: [],
        recentTransactions: [],
    });
    const [loading, setLoading] = useState(() => !financeCache || !isFresh(financeCacheAt, FINANCE_CACHE_TTL));

    const fetchFinance = useCallback(async ({ force = false } = {}) => {
        if (!force && financeCache && isFresh(financeCacheAt, FINANCE_CACHE_TTL)) {
            setStats(financeCache);
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data: payData } = await supabase
            .from('payments')
            .select(`
                id,
                amount,
                payment_method,
                transaction_date,
                category,
                description,
                members (
                    full_name,
                    member_code
                )
            `);
        const { data: expData } = await supabase.from('expenses').select('*');

        if (payData && expData) {
            const totalRev = payData.reduce((sum, p) => sum + Number(p.amount), 0);
            const totalExp = expData.reduce((sum, e) => sum + Number(e.amount), 0);

            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyData = new Array(12).fill(0).map((_, i) => {
                const date = new Date();
                date.setDate(1);
                date.setMonth(date.getMonth() - (11 - i));
                const monthIndex = date.getMonth();
                const year = date.getFullYear();

                const monthRev = payData
                    .filter(p => {
                        const d = new Date(p.transaction_date);
                        return d.getMonth() === monthIndex && d.getFullYear() === year;
                    })
                    .reduce((sum, p) => sum + Number(p.amount), 0);

                const monthExp = expData
                    .filter(e => {
                        const d = new Date(e.expense_date);
                        return d.getMonth() === monthIndex && d.getFullYear() === year;
                    })
                    .reduce((sum, e) => sum + Number(e.amount), 0);

                return {
                    month: months[monthIndex],
                    revenue: monthRev,
                    expenses: monthExp,
                    profit: monthRev - monthExp
                };
            });

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dailyData = new Array(30).fill(0).map((_, i) => {
                const date = new Date(now);
                date.setDate(date.getDate() - (29 - i));
                const dayIndex = date.getDay();
                const dayStr = date.toISOString().split('T')[0];

                const dayRev = payData
                    .filter(p => p.transaction_date && p.transaction_date.startsWith(dayStr))
                    .reduce((sum, p) => sum + Number(p.amount), 0);

                const dayExp = expData
                    .filter(e => e.expense_date && e.expense_date.startsWith(dayStr))
                    .reduce((sum, e) => sum + Number(e.amount), 0);

                return {
                    day: days[dayIndex],
                    date: dayStr,
                    revenue: dayRev,
                    expenses: dayExp,
                    profit: dayRev - dayExp
                };
            });

            const todayRevenue = payData
                .filter((payment) => payment.transaction_date?.startsWith(todayStr))
                .reduce((sum, payment) => sum + Number(payment.amount), 0);

            const todayExpenses = expData
                .filter((expense) => expense.expense_date?.startsWith(todayStr))
                .reduce((sum, expense) => sum + Number(expense.amount), 0);

            const expenseCategories = expData.reduce((acc, expense) => {
                acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
                return acc;
            }, {});

            const expenseBreakdown = Object.entries(expenseCategories)
                .map(([category, amount]) => ({
                    category,
                    amount,
                    percent: totalExp > 0 ? (amount / totalExp) * 100 : 0,
                }))
                .sort((a, b) => b.amount - a.amount);

            const recentTransactions = [
                ...payData.map((payment) => ({
                    id: payment.id,
                    type: 'income',
                    title: payment.category === 'Membership'
                        ? (payment.members?.full_name || 'Walk-in Member')
                        : (payment.description || payment.category),
                    subtitle: payment.category === 'Membership'
                        ? (payment.members?.member_code || 'N/A')
                        : payment.category,
                    amount: Number(payment.amount),
                    method: payment.payment_method,
                    date: payment.transaction_date,
                })),
                ...expData.map((expense) => ({
                    id: expense.id,
                    type: 'expense',
                    title: expense.description || expense.category,
                    subtitle: expense.category,
                    amount: Number(expense.amount),
                    method: expense.payment_method,
                    date: expense.expense_date,
                }))
            ]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 15);

            const nextStats = {
                revenue: totalRev,
                expenses: totalExp,
                netProfit: totalRev - totalExp,
                transactions: payData.length,
                mobileRevenue: payData.filter(p => p.payment_method === 'Mobile Money').reduce((sum, p) => sum + Number(p.amount), 0),
                cashRevenue: payData.filter(p => p.payment_method === 'Cash').reduce((sum, p) => sum + Number(p.amount), 0),
                todayRevenue,
                todayExpenses,
                monthlyData,
                dailyData,
                expenseCategories,
                expenseBreakdown,
                recentTransactions,
            };
            setStats(nextStats);
            financeCache = nextStats;
            financeCacheAt = Date.now();
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFinance();
    }, [fetchFinance]);

    return { stats, loading, refresh: () => fetchFinance({ force: true }) };
}

export function useFinanceActions() {
    const recordIncome = async (income) => {
        const { error } = await supabase
            .from('payments')
            .insert([{
                ...income,
                transaction_date: new Date().toISOString()
            }]);

        if (!error) {
            financeCache = null;
            financeCacheAt = 0;
            return true;
        }

        return false;
    };

    return { recordIncome };
}
