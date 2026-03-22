import { supabase } from './supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import emailjs from '@emailjs/browser';

// Helper to get date boundaries
const getDateRange = (scope) => {
    const end = new Date();
    const start = new Date();
    if (scope === '1d') {
        start.setHours(0, 0, 0, 0); // Start of today
    } else if (scope === '7d') {
        start.setDate(end.getDate() - 7);
    } else if (scope === '1m') {
        start.setMonth(end.getMonth() - 1);
    }
    return { start: start.toISOString(), end: end.toISOString() };
};

export const ReportService = {
    async fetchReportData(scope) {
        const { start, end } = getDateRange(scope);

        // Fetch Finances
        const { data: payments, error: pErr } = await supabase
            .from('payments')
            .select(`
                id, amount, payment_method, transaction_date, category, description,
                members (full_name, member_code)
            `)
            .gte('transaction_date', start)
            .lte('transaction_date', end)
            .order('transaction_date', { ascending: false });
        if (pErr) console.error("Error fetching payments for report:", pErr);

        const { data: expenses } = await supabase
            .from('expenses')
            .select('*')
            .gte('expense_date', start)
            .lte('expense_date', end)
            .order('expense_date', { ascending: false });

        // Fetch Members (Joined in range or globally active? Usually reports show new signups)
        const { data: newMembers } = await supabase
            .from('members')
            .select('first_name, last_name, plan_type, status, created_at')
            .gte('created_at', start)
            .lte('created_at', end)
            .order('created_at', { ascending: false });

        // Fetch Attendance
        const { data: attendance } = await supabase
            .from('attendance')
            .select(`
                check_in_time, status,
                member:members (first_name, last_name)
            `)
            .gte('check_in_time', start)
            .lte('check_in_time', end)
            .order('check_in_time', { ascending: false });

        return { payments, expenses, newMembers, attendance, start, end };
    },

    async generatePDF(scope) {
        const data = await this.fetchReportData(scope);
        const doc = new jsPDF();
        
        let yPos = 20;
        doc.setFontSize(20);
        doc.text("Infinity Gym - Executive Report", 14, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        const scopeLabel = scope === '1d' ? 'Daily Report' : scope === '7d' ? '7-Day Report' : 'Monthly Report';
        doc.text(`Scope: ${scopeLabel} | From: ${new Date(data.start).toLocaleDateString()} To: ${new Date(data.end).toLocaleDateString()}`, 14, yPos);
        
        // Finances Summary
        yPos += 15;
        doc.setFontSize(14);
        doc.text("Financial Transactions", 14, yPos);
        
        const totalRevenue = data.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        const totalExpenses = data.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        
        yPos += 10;
        doc.setFontSize(11);
        doc.text(`Total Revenue: RWF ${totalRevenue.toLocaleString()}`, 14, yPos);
        doc.text(`Total Expenses: RWF ${totalExpenses.toLocaleString()}`, 120, yPos);

        // Payments Table
        if (data.payments && data.payments.length > 0) {
            yPos += 10;
            const paymentBody = data.payments.map(p => [
                new Date(p.transaction_date).toLocaleDateString(),
                p.category === 'Membership' ? (p.members?.full_name || 'Walk-in Member') : (p.description || p.category),
                p.payment_method || 'N/A',
                `RWF ${p.amount.toLocaleString()}`
            ]);
            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Description', 'Method', 'Amount']],
                body: paymentBody,
                theme: 'striped',
                headStyles: { fillColor: [143, 196, 90] }
            });
            yPos = doc.lastAutoTable.finalY + 15;
        }

        // Expenses Table
        if (data.expenses && data.expenses.length > 0) {
            yPos += 10;
            const expenseBody = data.expenses.map(e => [
                new Date(e.expense_date).toLocaleDateString(),
                e.category,
                e.description || 'N/A',
                `RWF ${e.amount.toLocaleString()}`
            ]);
            autoTable(doc, {
                startY: yPos,
                head: [['Date', 'Category', 'Description', 'Amount']],
                body: expenseBody,
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68] }
            });
            yPos = doc.lastAutoTable.finalY + 15;
        }

        // New Members
        if (data.newMembers && data.newMembers.length > 0) {
            doc.addPage();
            yPos = 20;
            doc.setFontSize(14);
            doc.text(`New Member Registrations (${data.newMembers.length})`, 14, yPos);
            
            const memberBody = data.newMembers.map(m => [
                new Date(m.created_at).toLocaleDateString(),
                `${m.first_name} ${m.last_name}`,
                m.plan_type,
                m.status
            ]);
            autoTable(doc, {
                startY: yPos + 10,
                head: [['Date', 'Name', 'Plan', 'Status']],
                body: memberBody,
                theme: 'striped',
                headStyles: { fillColor: [46, 204, 113] }
            });
        }

        doc.save(`Infinity_Report_${scope}_${new Date().toISOString().split('T')[0]}.pdf`);
        return true;
    },

    async generateExcel(scope, returnBase64 = false) {
        const data = await this.fetchReportData(scope);
        
        // Payments Sheet
        const paymentsData = (data.payments || []).map(p => ({
            Date: new Date(p.transaction_date).toLocaleDateString(),
            Time: new Date(p.transaction_date).toLocaleTimeString(),
            Type: p.category || 'Income',
            Description: p.category === 'Membership' ? (p.members?.full_name || 'Walk-in Member') : (p.description || p.category),
            Amount: p.amount,
            Method: p.payment_method
        }));
        
        // Expenses Sheet
        const expensesData = (data.expenses || []).map(e => ({
            Date: new Date(e.expense_date).toLocaleDateString(),
            Category: e.category,
            Amount: e.amount,
            Description: e.description
        }));
        
        // Members Sheet
        const membersData = (data.newMembers || []).map(m => ({
            Joined: new Date(m.created_at).toLocaleDateString(),
            Name: `${m.first_name} ${m.last_name}`,
            Plan: m.plan_type,
            Status: m.status
        }));
        
        // Attendance Sheet
        const attendanceData = (data.attendance || []).map(a => ({
            Date: new Date(a.check_in_time).toLocaleDateString(),
            Time: new Date(a.check_in_time).toLocaleTimeString(),
            Member: a.member ? `${a.member.first_name} ${a.member.last_name}` : 'Unknown',
            Status: a.status
        }));

        const wb = XLSX.utils.book_new();
        
        if (paymentsData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paymentsData), 'Revenue');
        if (expensesData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expensesData), 'Expenses');
        if (membersData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(membersData), 'New Members');
        if (attendanceData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendanceData), 'Attendance');

        if (returnBase64) {
            return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        }

        XLSX.writeFile(wb, `Infinity_Report_${scope}_${new Date().toISOString().split('T')[0]}.xlsx`);
        return true;
    },

    async generateEmailPayload(scope) {
        const data = await this.fetchReportData(scope);
        const totalRevenue = data.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        const totalExpenses = data.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        const newMembers = data.newMembers?.length || 0;
        const totalCheckins = data.attendance?.length || 0;
        
        const scopeLabel = scope === '1d' ? 'Daily' : scope === '7d' ? '7-Day' : 'Monthly';

        // Very clean HTML summary for EmailJS body payload
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background-color: #f9f9fc; padding: 20px; border-radius: 8px;">
                <h2 style="color: #8fc45a; text-transform: uppercase;">Infinity Gym - ${scopeLabel} Report</h2>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                <hr style="border: 1px solid #eee;" />
                
                <h3 style="color: #444;">Financial Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr style="background-color: #8fc45a; color: white;">
                        <th style="padding: 10px; text-align: left;">Metric</th>
                        <th style="padding: 10px; text-align: right;">Amount (RWF)</th>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total Revenue</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #2ECC71;"><strong>${totalRevenue.toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total Expenses</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #EF4444;"><strong>${totalExpenses.toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Net Balance</strong></td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;"><strong>${(totalRevenue - totalExpenses).toLocaleString()}</strong></td>
                    </tr>
                </table>

                <h3 style="color: #444;">Operational Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #2ECC71; color: white;">
                        <th style="padding: 10px; text-align: left;">Metric</th>
                        <th style="padding: 10px; text-align: right;">Count</th>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">New Member Signups</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${newMembers}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">Total Gym Check-ins</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${totalCheckins}</td>
                    </tr>
                </table>
                <br />
                <p style="font-size: 12px; color: #888; text-align: center;">Infinity Gym Management System</p>
            </div>
        `;
        return htmlBody;
    },

    async sendViaEmailJS(scope, recipientEmail) {
        const htmlBody = await this.generateEmailPayload(scope);

        // VITE_ variables must be set securely on deploy (e.g. Netlify)
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (!serviceId || !templateId || !publicKey) {
            console.error("Missing EmailJS Environment Variables! Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY.");
            throw new Error("Email configuration missing. Please complete setup in your `.env` file or hosting provider.");
        }

        try {
            const response = await emailjs.send(
                serviceId,
                templateId,
                {
                    to_email: recipientEmail,
                    reply_to: 'admin@infinitygym.rw',
                    report_html: htmlBody
                },
                publicKey
            );
            return true;
        } catch (error) {
            console.error("EmailJS Transmission Failed:", error);
            // EmailJS provides detailed error info in error.text or error.message
            const errorMsg = error.text || error.message || JSON.stringify(error) || "Unknown EmailJS Error";
            throw new Error(`EmailJS Error: ${errorMsg}`);
        }
    }
};
