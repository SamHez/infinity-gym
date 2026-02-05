import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Login } from './components/Login';
import { Sidebar, MobileHeader } from './components/Navigation';
import { BottomNav } from './components/BottomNav';
import { DashboardSnapshot } from './components/DashboardSnapshot';
import { MembershipRegistration } from './components/MembershipRegistration';
import { MemberList } from './components/MemberList';
import { AttendanceTracking } from './components/AttendanceTracking';
import { FinanceReports } from './components/FinanceReports';
import { ExpiryMonitoring } from './components/ExpiryMonitoring';
import { TrainersSchedules } from './components/TrainersSchedules';
import { FrontDeskDashboard } from './components/FrontDeskDashboard';
import { useTheme } from './lib/useTheme';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
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

    setUser({ email: authUser.email, role: profile?.role?.toLowerCase() || 'receptionist', id: authUser.id });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleRegister = async (formData) => {
    try {
      // 1. Create Member
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert([{
          full_name: formData.fullName,
          category: formData.category,
          duration: formData.duration,
          start_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Placeholder 1 month
          status: 'Active'
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      // 2. Clear Registration State
      setShowRegistration(false);
      navigate('/members');

      // 3. Create initial payment
      const basePrice = 30000; // Simplified for this logic
      await supabase
        .from('payments')
        .insert([{
          member_id: member.id,
          amount: basePrice,
          payment_method: formData.paymentMethod
        }]);

    } catch (error) {
      console.error("Registration Error:", error.message);
      alert("Failed to register member. Check logs.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-accent text-[10px] font-black uppercase tracking-[1em] animate-pulse">Initializing System...</div>
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

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
          />
          <div className="lg:pl-80 flex flex-col min-h-screen relative">
            <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/[0.03] dark:bg-primary/[0.08] rounded-full blur-[100px] pointer-events-none transition-all" />
            <div className="fixed bottom-[-5%] left-[5%] w-[400px] h-[400px] bg-accent/[0.04] dark:bg-accent/[0.1] rounded-full blur-[80px] pointer-events-none transition-all" />
            <MobileHeader user={user} onLogout={handleLogout} />
            <main className={cn(
              "flex-1 px-6 pt-32 pb-40 lg:pt-16 lg:pb-16 max-w-[1400px] mx-auto w-full relative z-10",
              "animate-in fade-in duration-700"
            )}>
              <Routes>
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={() => { }} />} />
                <Route path="/dashboard" element={
                  user.role === 'manager' ? <DashboardSnapshot /> : <FrontDeskDashboard onNavigate={(tab, subAction) => {
                    navigate(`/${tab}`);
                    if (subAction === 'register') setShowRegistration(true);
                  }} />
                } />
                <Route path="/members" element={
                  showRegistration ? (
                    <MembershipRegistration onComplete={handleRegister} />
                  ) : (
                    <MemberList onAddMember={() => setShowRegistration(true)} />
                  )
                } />
                <Route path="/attendance" element={<AttendanceTracking />} />
                <Route path="/finance" element={<FinanceReports />} />
                <Route path="/expiry" element={user.role === 'manager' ? <ExpiryMonitoring /> : <Navigate to="/dashboard" />} />
                <Route path="/trainers" element={user.role === 'manager' ? <TrainersSchedules /> : <Navigate to="/dashboard" />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <BottomNav activeTab={activeTab} onTabChange={(tab) => navigate(`/${tab}`)} user={user} />
          </div>
        </>
      )}
      {!user && <Routes><Route path="*" element={<Login onLogin={() => { }} />} /></Routes>}
    </div>
  );
}

export default App;
