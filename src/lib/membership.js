export const membershipCategories = [
    { name: 'Normal Membership', price: 50000, desc: 'Comprehensive Gym Access' },
    { name: 'Group Membership', price: 300000, desc: 'Group of 10 Monthly Membership' },
    { name: 'Student (ALU)', price: 20000, desc: 'ALU Academic Discount' },
    { name: 'Student (CMU)', price: 30000, desc: 'CMU Academic Discount' },
    { name: 'Infinity Hotel Resident', price: 10000, desc: 'Special Resident Rate' },
    { name: 'Daily Pass', price: 4000, desc: 'Single Entry' },
];

export const defaultDurations = [
    { name: 'Monthly', discount: 0 },
    { name: '3 Months', discount: 0 },
    { name: '6 Months', discount: 0 },
    { name: 'Annual', discount: 0 },
];

export const customMonthOptions = Array.from({ length: 11 }, (_, index) => index + 2);

const pricingByCategory = {
    'Normal Membership': {
        monthly: 50000,
        presets: {
            '3 Months': 120000,
            '6 Months': 220000,
            Annual: 300000,
        },
    },
    'Group Membership': {
        monthly: 300000,
        presets: {},
    },
    'Student (ALU)': {
        monthly: 20000,
        presets: {
            '3 Months': 60000,
            '6 Months': 120000,
            Annual: 240000,
        },
    },
    'Student (CMU)': {
        monthly: 30000,
        presets: {
            '3 Months': 90000,
            '6 Months': 180000,
            Annual: 360000,
        },
    },
    'Infinity Hotel Resident': {
        monthly: 10000,
        presets: {
            '3 Months': 30000,
            '6 Months': 60000,
            Annual: 120000,
        },
    },
    'Daily Pass': {
        daily: 4000,
    },
};

const presetDurationNames = new Set(defaultDurations.map((duration) => duration.name));

const clampWholeNumber = (value, minimum, maximum) => {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
        return minimum;
    }

    return Math.min(maximum, Math.max(minimum, parsed));
};

export const getDefaultMembershipFormData = () => ({
    fullName: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    category: 'Normal Membership',
    duration: 'Monthly',
    customMonths: 2,
    dailyPassDays: 1,
    paymentMethod: 'Cash',
    branchCode: 'HQ',
    picture: null,
});

export const getEditableMembershipFormData = (member) => {
    const durationInfo = parseStoredDuration(member.category, member.duration);

    return {
        fullName: member.full_name || '',
        phone: member.phone || '',
        startDate: new Date().toISOString().split('T')[0],
        category: member.category || 'Normal Membership',
        duration: durationInfo.duration,
        customMonths: durationInfo.customMonths,
        dailyPassDays: durationInfo.dailyPassDays,
        paymentMethod: 'Cash',
        branchCode: member.branch_code || 'HQ',
        picture: member.picture_url || null,
        status: member.status || 'Active',
    };
};

export const parseStoredDuration = (category, storedDuration) => {
    if (category === 'Daily Pass') {
        const matchedDays = storedDuration?.match(/(\d+)\s+day/i);

        return {
            duration: 'Monthly',
            customMonths: 2,
            dailyPassDays: clampWholeNumber(matchedDays?.[1] || 1, 1, 365),
        };
    }

    if (presetDurationNames.has(storedDuration)) {
        return {
            duration: storedDuration,
            customMonths: 2,
            dailyPassDays: 1,
        };
    }

    const matchedMonths = storedDuration?.match(/(\d+)\s+month/i);

    return {
        duration: matchedMonths ? 'Custom Months' : 'Monthly',
        customMonths: clampWholeNumber(matchedMonths?.[1] || 2, 2, 12),
        dailyPassDays: 1,
    };
};

export const getMembershipPrice = (formData) => {
    if (formData.category === 'Daily Pass') {
        const dailyRate = pricingByCategory['Daily Pass'].daily || 0;
        return dailyRate * clampWholeNumber(formData.dailyPassDays, 1, 365);
    }

    const categoryPricing = pricingByCategory[formData.category];
    const monthlyPrice = categoryPricing?.monthly || 0;
    const customMonths = clampWholeNumber(formData.customMonths, 2, 12);

    if (formData.duration === 'Custom Months') {
        return monthlyPrice * customMonths;
    }

    if (categoryPricing?.presets?.[formData.duration]) {
        return categoryPricing.presets[formData.duration];
    }

    if (formData.duration === '3 Months') return monthlyPrice * 3;
    if (formData.duration === '6 Months') return monthlyPrice * 6;
    if (formData.duration === 'Annual') return monthlyPrice * 12;

    return monthlyPrice;
};

export const calculateMembershipExpiryDate = (formData) => {
    const expiry = new Date(formData.startDate || new Date());

    if (formData.category === 'Daily Pass') {
        expiry.setDate(expiry.getDate() + clampWholeNumber(formData.dailyPassDays, 1, 365));
        return expiry;
    }

    if (formData.duration === 'Custom Months') {
        expiry.setMonth(expiry.getMonth() + clampWholeNumber(formData.customMonths, 2, 12));
        return expiry;
    }

    if (formData.duration === '3 Months') expiry.setMonth(expiry.getMonth() + 3);
    else if (formData.duration === '6 Months') expiry.setMonth(expiry.getMonth() + 6);
    else if (formData.duration === 'Annual') expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setMonth(expiry.getMonth() + 1);

    return expiry;
};

export const getStoredDuration = (formData) => {
    if (formData.category === 'Daily Pass') {
        const days = clampWholeNumber(formData.dailyPassDays, 1, 365);
        return `${days} ${days === 1 ? 'Day' : 'Days'}`;
    }

    if (formData.duration === 'Custom Months') {
        const months = clampWholeNumber(formData.customMonths, 2, 12);
        return `${months} Months`;
    }

    return formData.duration;
};

export const getCustomMonthsSummary = (months) => {
    const normalizedMonths = clampWholeNumber(months, 2, 12);
    return `${normalizedMonths} Months`;
};
