import React, { useState } from 'react';
import { UserProvider, useUser } from './UserContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { VendorDashboard } from './pages/VendorDashboard';
import { OfficialDashboard } from './pages/OfficialDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

const AppContent: React.FC = () => {
  const { user, role, isLoading } = useUser();
  const [view, setView] = useState<'LANDING' | 'AUTH'>('LANDING');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center">
        <div className="animate-pulse text-[#141414] font-mono uppercase tracking-widest">Loading Wallet...</div>
      </div>
    );
  }

  if (!user) {
    if (view === 'LANDING') {
      return <LandingPage onGetStarted={() => setView('AUTH')} />;
    }
    return <AuthPage onBack={() => setView('LANDING')} />;
  }

  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'OFFICIAL':
      return <OfficialDashboard />;
    case 'VENDOR':
    default:
      return <VendorDashboard />;
  }
};

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
