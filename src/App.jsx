import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Login } from './components/Login';
import { Sidebar, MobileHeader, TopNav } from './components/Navigation';
import { BottomNav } from './components/BottomNav';
import { DashboardSnapshot } from './components/DashboardSnapshot';
import { MembershipRegistration } from './components/MembershipRegistration';
import { MemberList } from './components/MemberList';
import { AttendanceTracking } from './components/AttendanceTracking';
import { FinanceReports } from './components/FinanceReports';
import ExpenseManagement from './components/ExpenseManagement';
import { ExpiryMonitoring } from './components/ExpiryMonitoring';
import { MemberEdit } from './components/MemberEdit';
import { FrontDeskDashboard } from './components/FrontDeskDashboard';
import { IncomeModal } from './components/IncomeModal';
import { LoadingScreen } from './components/LoadingScreen';
import { useTheme } from './lib/useTheme';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { useToast } from './context/ToastContext';
import { useFinanceActions } from './lib/data-hooks';

function App() {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [incomeModal, setIncomeModal] = useState({ isOpen: false, type: 'Selling Water' });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { recordIncome } = useFinanceActions();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    let finalRole = profile?.role?.toLowerCase()?.trim() || 'receptionist';
    if (authUser.email.toLowerCase().includes('manager') || authUser.email.toLowerCase().includes('admin')) {
      finalRole = 'manager';
    }
    setUser({ email: authUser.email, role: finalRole, id: authUser.id });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleRegister = async (formData, totalPrice) => {
    try {
      // 1. Generate Unique Member Code
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      const branchCode = formData.branchCode || 'HQ';
      const memberCode = `IG-${branchCode}-${year}-${random}`;

      // 2. Calculate Expiry Date
      let startDate = formData.startDate ? new Date(formData.startDate) : new Date();
      let expiryDate = new Date(startDate);
      
      if (formData.category === 'Daily Pass') {
          expiryDate.setDate(expiryDate.getDate() + 1);
      } else {
          if (formData.duration === 'Weekly') expiryDate.setDate(expiryDate.getDate() + 7);
          else if (formData.duration === 'Monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
          else if (formData.duration === '3 Months') expiryDate.setMonth(expiryDate.getMonth() + 3);
          else if (formData.duration === 'Annual') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // 3. Create Member
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert([{
          member_code: memberCode,
          branch_code: branchCode,
          full_name: formData.fullName,
          phone: formData.phone || '',
          category: formData.category,
          duration: formData.category === 'Daily Pass' ? 'Daily' : formData.duration,
          picture_url: formData.picture,
          start_date: startDate.toISOString().split('T')[0],
          expiry_date: expiryDate.toISOString().split('T')[0],
          status: 'Active'
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      setShowRegistration(false);
      navigate('/members');

      // 4. Create initial payment
      await supabase
        .from('payments')
        .insert([{
          member_id: member.id,
          amount: totalPrice,
          payment_method: formData.paymentMethod
        }]);

    } catch (error) {
      console.error("Registration Error:", error.message);
      showToast("Failed to register member: " + error.message, "error");
    }
  };

  if (loading) {
    return <LoadingScreen message="Initializing System" />;
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  const handleUpdateMember = async (formData, totalPrice, isRenewal) => {
    try {
      // 1. Calculate New Expiry Date if renewal
      let expiryDate = new Date(editingMember.expiry_date);
      if (isRenewal) {
        let startDate = formData.startDate ? new Date(formData.startDate) : new Date();
        expiryDate = new Date(startDate);
        if (formData.category === 'Daily Pass') {
            expiryDate.setDate(expiryDate.getDate() + 1);
        } else {
            if (formData.duration === 'Weekly') expiryDate.setDate(expiryDate.getDate() + 7);
            else if (formData.duration === 'Monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
            else if (formData.duration === '3 Months') expiryDate.setMonth(expiryDate.getMonth() + 3);
            else if (formData.duration === 'Annual') expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
      }

      // 2. Update Member
      const { error: updateError } = await supabase
        .from('members')
        .update({
          full_name: formData.fullName,
          phone: formData.phone || '',
          category: formData.category,
          duration: formData.category === 'Daily Pass' ? 'Daily' : formData.duration,
          picture_url: formData.picture,
          start_date: formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : editingMember.start_date,
          expiry_date: isRenewal ? expiryDate.toISOString().split('T')[0] : editingMember.expiry_date,
          status: isRenewal ? 'Active' : formData.status,
          branch_code: formData.branchCode || editingMember.branch_code
        })
        .eq('id', editingMember.id);

      if (updateError) throw updateError;

      // 3. Log payment if renewal
      if (isRenewal) {
        await supabase
          .from('payments')
          .insert([{
            member_id: editingMember.id,
            amount: totalPrice,
            payment_method: formData.paymentMethod
          }]);
      }

      setEditingMember(null);
      navigate('/members');
    } catch (error) {
      console.error("Update Error:", error.message);
      showToast("Failed to update member: " + error.message, "error");
    }
  };

  const activeTab = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="min-h-screen bg-surface text-text transition-colors duration-500">
      {user && (
        <>
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => navigate(`/${tab}`)}
            user={user}
            onLogout={handleLogout}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <div className={cn(
            "flex flex-col min-h-screen relative transition-all duration-300 gap-6",
            isSidebarCollapsed ? "lg:pl-28" : "lg:pl-72"
          )}>
            <div className="fixed top-[-15%] right-[-10%] w-[600px] h-[600px] bg-primary/[0.08] dark:bg-primary/[0.15] rounded-full blur-[120px] pointer-events-none transition-all animate-pulse duration-[10s]" />
            <div className="fixed bottom-[-10%] left-[5%] w-[500px] h-[500px] bg-accent/[0.1] dark:bg-accent/[0.2] rounded-full blur-[100px] pointer-events-none transition-all animate-pulse duration-[8s]" />
            <MobileHeader user={user} onLogout={handleLogout} />
            <div className="hidden lg:block">
              <TopNav
                user={user}
                onLogout={handleLogout}
                isSidebarCollapsed={isSidebarCollapsed}
                activeTab={activeTab}
                onNavigate={(tab, subAction) => {
                  navigate(`/${tab}`);
                  if (subAction === 'register') setShowRegistration(true);
                  if (subAction === 'sell_water') setIncomeModal({ isOpen: true, type: 'Selling Water' });
                  if (subAction === 'custom_income') setIncomeModal({ isOpen: true, type: 'Custom Income' });
                  if (subAction === 'finance_reports_add') setIncomeModal({ isOpen: true, type: 'Custom Income' });
                }}
              />
            </div>
            <main className={cn(
              "flex-1 px-10 md:px-16 lg:px-20 pt-32 pb-40 lg:pt-3 lg:pb-16 max-w-[1800px] w-full relative z-10",
              "animate-in fade-in duration-150"
            )}>
              <Routes>
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} />
                <Route path="/dashboard" element={
                  (user.role === 'manager' || user.role === 'admin') ? <DashboardSnapshot /> : <FrontDeskDashboard onNavigate={(tab, subAction) => {
                    navigate(`/${tab}`);
                    if (subAction === 'register') setShowRegistration(true);
                    if (subAction === 'sell_water') setIncomeModal({ isOpen: true, type: 'Selling Water' });
                    if (subAction === 'custom_income') setIncomeModal({ isOpen: true, type: 'Custom Income' });
                  }} />
                } />
                <Route path="/members" element={
                  showRegistration ? (
                    <MembershipRegistration onComplete={handleRegister} onCancel={() => setShowRegistration(false)} />
                  ) : editingMember ? (
                    <MemberEdit member={editingMember} onComplete={handleUpdateMember} onCancel={() => setEditingMember(null)} />
                  ) : (
                    <MemberList onAddMember={() => setShowRegistration(true)} onEditMember={setEditingMember} />
                  )
                } />
                <Route path="/attendance" element={<AttendanceTracking />} />
                <Route path="/finance" element={<FinanceReports onNavigate={(tab, subAction) => {
                  navigate(`/${tab}`);
                  if (subAction === 'finance_reports_add') setIncomeModal({ isOpen: true, type: 'Custom Income' });
                  if (subAction === 'sell_water') setIncomeModal({ isOpen: true, type: 'Selling Water' });
                }} />} />
                <Route path="/expenses" element={<ExpenseManagement user={user} />} />
                <Route path="/expiry" element={(user.role === 'manager' || user.role === 'admin') ? <ExpiryMonitoring /> : <Navigate to="/dashboard" />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <BottomNav activeTab={activeTab} onTabChange={(tab) => navigate(`/${tab}`)} user={user} />
          </div>
        </>
      )}
      {!user && <Routes><Route path="*" element={<Login onLogin={setUser} />} /></Routes>}
      {incomeModal.isOpen && (
        <IncomeModal
          isOpen={incomeModal.isOpen}
          initialType={incomeModal.type}
          onClose={() => setIncomeModal({ ...incomeModal, isOpen: false })}
          onConfirm={async (data) => {
            const success = await recordIncome(data);
            if (success) showToast("Income record saved successfully", "success");
            return success;
          }}
        />
      )}
    </div>
  );
}

export default App;
