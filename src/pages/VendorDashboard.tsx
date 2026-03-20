import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { 
  Calculator, 
  Receipt, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Mic, 
  Camera,
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  IdCard,
  Award,
  User,
  Settings,
  HelpCircle,
  FileCheck,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BusinessRegistrationForm } from '../components/BusinessRegistrationForm';
import { DigitalID } from '../components/DigitalID';
import { WalletManager } from '../components/WalletManager';
import { NotificationCenter } from '../components/NotificationCenter';
import { Certificate } from '../components/Certificate';
import { PidginVoice } from '../components/PidginVoice';
import { ComplianceReport } from '../components/ComplianceReport';
import { ProfileView } from '../components/dashboard/ProfileView';
import { DocumentsView } from '../components/dashboard/DocumentsView';
import { SettingsView } from '../components/dashboard/SettingsView';
import { HelpView } from '../components/dashboard/HelpView';
import { DigitalIDView } from '../components/dashboard/DigitalIDView';
import { LevyPaymentView } from '../components/dashboard/LevyPaymentView';
import { TaxLoggingView } from '../components/dashboard/TaxLoggingView';
import { BusinessRegistrationView } from '../components/dashboard/BusinessRegistrationView';

type DashboardView = 'MAIN' | 'TAX' | 'LEVY' | 'HEALTH' | 'REPORTS' | 'REGISTER_BUSINESS' | 'DIGITAL_ID' | 'CERTIFICATE' | 'PROFILE' | 'DOCUMENTS' | 'SETTINGS' | 'HELP';

export const VendorDashboard: React.FC = () => {
  const { user, logout } = useUser();
  const [view, setView] = useState<DashboardView>('MAIN');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [taxRecords, setTaxRecords] = useState<any[]>([]);
  const [business, setBusiness] = useState<any | null>(null);
  const [lgaBands, setLgaBands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<'CAC' | 'HEALTH' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [dashboardRes, bandsRes] = await Promise.all([
          fetch(`/api/vendor/dashboard/${user.id}`, {
            headers: { 'x-user-role': 'VENDOR', 'x-user-id': user.id }
          }),
          fetch('/api/lga-bands')
        ]);

        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setTaxRecords(data.taxRecords || []);
          setBusiness(data.business);
        }
        if (bandsRes.ok) setLgaBands(await bandsRes.json());
      } catch (error) {
        console.error('Failed to fetch vendor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleRegisterBusiness = async (formData: any) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'VENDOR',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          id: `biz-${Date.now()}`,
          vendorId: user.id,
          name: formData.name,
          lgaId: formData.lga,
          address: formData.address,
          businessType: formData.type,
          photoUrl: formData.photo,
          registrationStatus: 'SUBMITTED'
        })
      });

      if (response.ok) {
        // Refresh business data
        const bizRes = await fetch(`/api/business/${user.id}`, {
          headers: { 'x-user-role': 'VENDOR', 'x-user-id': user.id }
        });
        if (bizRes.ok) setBusiness(await bizRes.json());
        setView('MAIN');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMain = () => (
    <div className="space-y-6 pb-24">
      {/* Welcome & Status */}
      <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-serif italic">Welcome, {user?.firstName}</h2>
            <p className="text-[10px] font-mono uppercase opacity-50">{business?.lga_id || 'Rivers State'} • Port Harcourt</p>
          </div>
          <div className={`px-2 py-1 text-[10px] font-mono border ${
            business?.registration_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            business?.registration_status === 'SUBMITTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-red-50 text-red-700 border-red-200'
          }`}>
            {business?.registration_status || 'NOT REGISTERED'}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          {business?.registration_status === 'APPROVED' ? (
            <div className="flex items-center gap-2 text-[10px] font-mono opacity-50">
              <CheckCircle2 size={12} className="text-emerald-500" />
              CAC: {business.cac_registration_number} • TAX ID: PH-{user?.id.slice(-5)}
            </div>
          ) : (
            <button 
              onClick={() => setView('REGISTER_BUSINESS')}
              className="text-[10px] font-mono text-blue-600 underline"
            >
              {business?.registration_status === 'SUBMITTED' ? 'View Application' : 'Register your business now'}
            </button>
          )}
          <PidginVoice 
            text="Welcome to your dashboard. You can see your wallet balance, your digital ID, and log your daily sales here." 
            context="Vendor Dashboard Welcome"
          />
        </div>
      </div>

      {/* Wallet Section */}
      {user && <WalletManager userId={user.id} />}

      {/* Digital ID & Certificates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setView('DIGITAL_ID')}
          className="bg-white border border-[#141414] p-6 flex items-center gap-4 hover:bg-[#f9f9f9] transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center">
            <IdCard size={24} />
          </div>
          <div className="text-left">
            <div className="text-[10px] opacity-50 uppercase font-mono">View My</div>
            <div className="text-lg font-serif italic">Digital ID</div>
          </div>
        </button>

        <button 
          onClick={() => {
            if (business?.registration_status === 'APPROVED') {
              setSelectedCertificate('CAC');
              setView('CERTIFICATE');
            } else {
              alert("Your CAC registration is not yet approved.");
            }
          }}
          className="bg-white border border-[#141414] p-6 flex items-center gap-4 hover:bg-[#f9f9f9] transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div className="text-left">
            <div className="text-[10px] opacity-50 uppercase font-mono">View My</div>
            <div className="text-lg font-serif italic">CAC Certificate</div>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setView('TAX')}
          className="bg-[#141414] text-white p-6 flex flex-col gap-4 hover:translate-y-[-2px] transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,0.3)]"
        >
          <Calculator size={24} />
          <div className="text-left">
            <div className="text-[10px] opacity-50 uppercase font-mono">Log Daily</div>
            <div className="text-lg font-serif italic">Turnover</div>
          </div>
        </button>
        <button 
          onClick={() => setView('LEVY')}
          className="bg-white border border-[#141414] p-6 flex flex-col gap-4 hover:translate-y-[-2px] transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
        >
          <Receipt size={24} />
          <div className="text-left">
            <div className="text-[10px] opacity-50 uppercase font-mono">Record</div>
            <div className="text-lg font-serif italic">Levy Pay</div>
          </div>
        </button>
      </div>

      {/* Compliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-serif italic text-xl">Tax Status</h3>
            <TrendingUp size={20} className="opacity-30" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] opacity-50 uppercase font-mono">This Month</div>
                <div className="text-3xl font-mono">₦12,400</div>
              </div>
              <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-1 border border-emerald-200">UP TO DATE</div>
            </div>
            <div className="h-1.5 bg-[#E4E3E0] overflow-hidden">
              <div className="h-full bg-[#141414] w-[85%]" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-serif italic text-xl">Health Permit</h3>
            <ShieldCheck size={20} className="opacity-30" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[10px] opacity-50 uppercase font-mono">Expires In</div>
                <div className="text-2xl font-mono text-amber-600">14 Days</div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center">
                <span className="text-[10px] font-bold font-mono">80%</span>
              </div>
            </div>
            <button 
              onClick={() => setView('HEALTH')}
              className="w-full py-2 border border-[#141414] text-[10px] font-mono uppercase hover:bg-[#141414] hover:text-white transition-all"
            >
              Renew Permit
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="p-4 border-b border-[#141414] flex justify-between items-center">
          <h3 className="font-serif italic text-lg">Recent History</h3>
          <button className="text-[10px] font-mono uppercase opacity-50 hover:opacity-100">View All</button>
        </div>
        <div className="divide-y divide-[#141414]">
          {taxRecords.length > 0 ? taxRecords.slice(0, 5).map((item, i) => (
            <div key={i} className="p-4 flex justify-between items-center hover:bg-[#f9f9f9] transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-[#E4E3E0] flex items-center justify-center">
                  <Calculator size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium">Turnover Log</div>
                  <div className="text-[10px] opacity-50 font-mono uppercase">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold">₦{item.turnover_amount.toLocaleString()}</div>
                <div className="text-[8px] opacity-50 uppercase font-mono">Tax: ₦{item.calculated_tax_amount}</div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-[10px] font-mono uppercase opacity-30">No records found</div>
          )}
        </div>
      </div>
    </div>
  );

  const [turnover, setTurnover] = useState('');

  const handleLogTax = async () => {
    if (!user || !turnover) return;
    setIsLoading(true);
    const amount = parseFloat(turnover);
    
    // Find appropriate band
    const band = lgaBands.find(b => amount >= b.min_turnover && amount <= b.max_turnover) || lgaBands[0];
    const tax = band.daily_tax;
    
    try {
      // First, try to pay from wallet
      const payRes = await fetch('/api/wallet/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'VENDOR',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          userId: user.id,
          amount: tax,
          description: `Daily Tax (${band.name})`
        })
      });

      if (!payRes.ok) {
        const err = await payRes.json();
        alert(err.error || "Payment failed. Please top up your wallet.");
        return;
      }

      const response = await fetch('/api/tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role || 'VENDOR',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          id: `tax-${Date.now()}`,
          vendorId: user.id,
          date: new Date().toISOString(),
          turnover: { amount },
          calculatedTax: { amount: tax },
          lgaBandId: band.id
        })
      });

      if (response.ok) {
        setTurnover('');
        setView('MAIN');
        // Refresh records
        const refreshResponse = await fetch(`/api/tax/${user.id}`, {
          headers: {
            'x-user-role': user.role || 'VENDOR',
            'x-user-id': user.id
          }
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setTaxRecords(data);
        }
      }
    } catch (error) {
      console.error('Failed to log tax:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTax = () => {
    const amount = parseFloat(turnover || '0');
    const band = lgaBands.find(b => amount >= b.min_turnover && amount <= b.max_turnover) || lgaBands[0];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('MAIN')} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-[#141414] transition-all">
            <X size={20} />
          </button>
          <h2 className="text-2xl font-serif italic">Log Daily Turnover</h2>
        </div>

        <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-mono uppercase tracking-widest opacity-50 block">How much you sell today? (₦)</label>
              <PidginVoice text="Enter how much money you make today. We go calculate your tax based on your business size." context="Tax Logging Guidance" />
            </div>
            <input 
              type="number" 
              placeholder="0.00"
              value={turnover}
              onChange={(e) => setTurnover(e.target.value)}
              className="w-full text-5xl font-mono border-none focus:ring-0 p-0 placeholder:opacity-10"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[2000, 5000, 10000].map(amt => (
              <button 
                key={amt} 
                onClick={() => setTurnover(amt.toString())}
                className="py-4 border border-[#141414] font-mono text-xs hover:bg-[#141414] hover:text-white transition-all"
              >
                ₦{amt/1000}k
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-[#141414] space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase opacity-50">Calculated Tax ({band?.name || '---'})</span>
              <span className="text-2xl font-mono">₦{band?.daily_tax || 0}</span>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-600 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-emerald-800 italic">
                "Amara, this tax go help you get loan from Microfinance Bank later. Keep am up!"
              </p>
            </div>

            <button 
              onClick={handleLogTax}
              disabled={isLoading || !turnover}
              className="w-full bg-[#141414] text-white py-5 font-mono uppercase tracking-[0.2em] hover:bg-opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Pay from Wallet'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans pb-20">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-[#E4E3E0] border-b border-[#141414] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <span className="font-serif italic text-xl">Compliance Wallet</span>
        </div>
        
        <div className="flex items-center gap-4">
          {isOffline && (
            <div className="flex items-center gap-1 text-[8px] font-mono bg-amber-100 px-2 py-1 border border-amber-200">
              <Clock size={10} />
              OFFLINE
            </div>
          )}
          {user && <NotificationCenter userId={user.id} />}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-white border border-transparent hover:border-[#141414] transition-all"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'MAIN' && renderMain()}
            {view === 'TAX' && user && <TaxLoggingView user={user} onComplete={() => setView('MAIN')} />}
            {view === 'PROFILE' && user && <ProfileView userId={user.id} />}
            {view === 'DOCUMENTS' && user && <DocumentsView userId={user.id} />}
            {view === 'SETTINGS' && user && <SettingsView userId={user.id} />}
            {view === 'HELP' && user && <HelpView userId={user.id} />}
            {view === 'DIGITAL_ID' && user && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setView('MAIN')} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-[#141414] transition-all">
                    <X size={20} />
                  </button>
                  <h2 className="text-2xl font-serif italic">My Digital ID</h2>
                </div>
                <DigitalIDView user={user} business={business} />
                <PidginVoice text="Dis na your official ID. Official fit scan am to see say you dey compliant." context="Digital ID Guidance" />
              </div>
            )}
            {view === 'CERTIFICATE' && user && business && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setView('MAIN')} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-[#141414] transition-all">
                    <X size={20} />
                  </button>
                  <h2 className="text-2xl font-serif italic">Digital Certificate</h2>
                </div>
                <Certificate 
                  type={selectedCertificate || 'CAC'}
                  businessName={business.name}
                  vendorName={user.firstName + ' ' + user.lastName}
                  number={business.cac_registration_number || 'PENDING'}
                  issueDate={business.created_at}
                />
              </div>
            )}
            {view === 'REGISTER_BUSINESS' && user && (
              <BusinessRegistrationView user={user} onComplete={() => setView('MAIN')} />
            )}
            {view === 'LEVY' && user && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setView('MAIN')} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-[#141414] transition-all">
                    <X size={20} />
                  </button>
                  <h2 className="text-2xl font-serif italic">Pay Levies</h2>
                </div>
                <LevyPaymentView user={user} />
              </div>
            )}
            {view === 'HEALTH' && (
              <div className="text-center py-20 opacity-30 font-mono uppercase text-xs">Health Permit Manager Coming Soon</div>
            )}
            {view === 'REPORTS' && user && (
              <ComplianceReport 
                user={user}
                business={business}
                taxRecords={taxRecords}
                onClose={() => setView('MAIN')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#141414] px-8 py-4 flex justify-between items-center max-w-2xl mx-auto">
        <button onClick={() => setView('MAIN')} className={`p-2 transition-all ${view === 'MAIN' ? 'text-[#141414] scale-110' : 'opacity-20'}`}>
          <CheckCircle2 size={24} />
        </button>
        <button onClick={() => setView('TAX')} className={`p-2 transition-all ${view === 'TAX' ? 'text-[#141414] scale-110' : 'opacity-20'}`}>
          <Calculator size={24} />
        </button>
        <div className="relative -top-8">
          <button 
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className={`bg-[#141414] text-white p-5 rounded-full shadow-[0px_8px_16px_rgba(0,0,0,0.2)] hover:scale-105 transition-all ${isQuickActionOpen ? 'rotate-45' : ''}`}
          >
            <Plus size={28} />
          </button>
          
          <AnimatePresence>
            {isQuickActionOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden"
              >
                <div className="divide-y divide-[#141414]">
                  <button 
                    onClick={() => { setView('TAX'); setIsQuickActionOpen(false); }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#f5f5f5] text-left"
                  >
                    <Calculator size={16} />
                    <span className="text-[10px] font-mono uppercase">Log Turnover</span>
                  </button>
                  <button 
                    onClick={() => { setView('LEVY'); setIsQuickActionOpen(false); }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#f5f5f5] text-left"
                  >
                    <Receipt size={16} />
                    <span className="text-[10px] font-mono uppercase">Pay Levy</span>
                  </button>
                  <button 
                    onClick={() => { setView('REPORTS'); setIsQuickActionOpen(false); }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#f5f5f5] text-left"
                  >
                    <FileText size={16} />
                    <span className="text-[10px] font-mono uppercase">Get Report</span>
                  </button>
                  <button 
                    onClick={() => { setView('DIGITAL_ID'); setIsQuickActionOpen(false); }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#f5f5f5] text-left"
                  >
                    <IdCard size={16} />
                    <span className="text-[10px] font-mono uppercase">Show ID</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={() => setView('LEVY')} className={`p-2 transition-all ${view === 'LEVY' ? 'text-[#141414] scale-110' : 'opacity-20'}`}>
          <Receipt size={24} />
        </button>
        <button onClick={() => setView('REPORTS')} className={`p-2 transition-all ${view === 'REPORTS' ? 'text-[#141414] scale-110' : 'opacity-20'}`}>
          <FileText size={24} />
        </button>
      </div>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#E4E3E0] p-8 flex flex-col"
          >
            <div className="flex justify-end mb-12">
              <button onClick={() => setIsMenuOpen(false)} className="p-2 border border-[#141414]">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-8 flex-1">
              <button 
                onClick={() => { setView('PROFILE'); setIsMenuOpen(false); }}
                className="w-full text-left text-4xl font-serif italic hover:translate-x-4 transition-transform"
              >
                My Profile
              </button>
              <button 
                onClick={() => { setView('DOCUMENTS'); setIsMenuOpen(false); }}
                className="w-full text-left text-4xl font-serif italic hover:translate-x-4 transition-transform"
              >
                CAC Documents
              </button>
              <button 
                onClick={() => { setView('SETTINGS'); setIsMenuOpen(false); }}
                className="w-full text-left text-4xl font-serif italic hover:translate-x-4 transition-transform"
              >
                Settings
              </button>
              <button 
                onClick={() => { setView('HELP'); setIsMenuOpen(false); }}
                className="w-full text-left text-4xl font-serif italic hover:translate-x-4 transition-transform"
              >
                Help (Pidgin)
              </button>
            </div>
            <button 
              onClick={logout}
              className="w-full py-4 border border-[#141414] font-mono uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#141414] hover:text-white transition-all"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
