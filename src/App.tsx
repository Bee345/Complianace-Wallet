/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Wallet, 
  History, 
  FileText, 
  User as UserIcon, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  Mic,
  Languages,
  ArrowRight
} from 'lucide-react';
import { Button, Card, Input } from './presentation/components/UI.tsx';
import { GeminiPidginServiceImpl } from './infrastructure/services/GeminiPidginServiceImpl.ts';
import { TaxCalculatorServiceImpl } from './infrastructure/services/TaxCalculatorImpl.ts';
import { SQLiteTaxRepository, SQLiteLevyRepository, SQLiteHealthRepository, SQLiteVendorRepository } from './infrastructure/persistence/SQLiteRepositories.ts';
import { LogTurnoverUseCase } from './application/use-cases/LogTurnover.ts';
import { LogLevyUseCase } from './application/use-cases/LogLevy.ts';
import { UpdateHealthPermitUseCase } from './application/use-cases/UpdateHealthPermit.ts';
import { ReportService } from './services/ReportService.ts';
import { TaxRecord, LevyRecord, HealthPermit, UserRole, User } from './types.ts';

export default function App() {
  // Infrastructure & Application Instances
  const pidginService = useMemo(() => new GeminiPidginServiceImpl(), []);
  const taxCalculator = useMemo(() => new TaxCalculatorServiceImpl(), []);
  const taxRepository = useMemo(() => new SQLiteTaxRepository(), []);
  const levyRepository = useMemo(() => new SQLiteLevyRepository(), []);
  const healthRepository = useMemo(() => new SQLiteHealthRepository(), []);
  const vendorRepository = useMemo(() => new SQLiteVendorRepository(), []);
  const reportService = useMemo(() => new ReportService(), []);

  const logTurnoverUseCase = useMemo(() => new LogTurnoverUseCase(taxRepository, taxCalculator), [taxRepository, taxCalculator]);
  const logLevyUseCase = useMemo(() => new LogLevyUseCase(levyRepository), [levyRepository]);
  const updateHealthPermitUseCase = useMemo(() => new UpdateHealthPermitUseCase(healthRepository), [healthRepository]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pidginWelcome, setPidginWelcome] = useState('Welcome back, vendor!');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('VENDOR');
  
  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showLevyModal, setShowLevyModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form States
  const [turnoverAmount, setTurnoverAmount] = useState('');
  const [levyAmount, setLevyAmount] = useState('');
  const [levyCategory, setLevyCategory] = useState('Market Levy');
  const [permitNumber, setPermitNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Data States
  const [recentActivity, setRecentActivity] = useState<(TaxRecord | LevyRecord)[]>([]);
  const [healthPermit, setHealthPermit] = useState<HealthPermit | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [adminVendors, setAdminVendors] = useState<any[]>([]);

  // Mock Vendor ID for demo
  const VENDOR_ID = 'vendor-123';
  const LGA_ID = 'ph-city';

  useEffect(() => {
    const fetchPidgin = async () => {
      try {
        const translated = await pidginService.translate("Welcome back, vendor! How is your business today?");
        setPidginWelcome(translated);
      } catch (error) {
        console.error("Failed to translate welcome message:", error);
      }
    };
    fetchPidgin();
    fetchActivity();
  }, [pidginService]);

  const fetchActivity = async () => {
    try {
      const [taxHistory, levyHistory] = await Promise.all([
        taxRepository.getHistory(VENDOR_ID),
        levyRepository.getHistory(VENDOR_ID)
      ]);
      
      const combined = [
        ...taxHistory.map(t => ({ ...t, type: 'tax' as const })),
        ...levyHistory.map(l => ({ ...l, type: 'levy' as const }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setRecentActivity(combined);
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    }
  };

  const fetchHealthPermit = async () => {
    try {
      const permit = await healthRepository.getByVendorId(VENDOR_ID);
      setHealthPermit(permit);
    } catch (error) {
      console.error("Failed to fetch health permit:", error);
    }
  };

  const fetchAdminVendors = async () => {
    if (userRole !== 'ADMIN') return;
    try {
      const res = await fetch('/api/admin/vendors', {
        headers: { 'x-user-role': 'ADMIN' }
      });
      const data = await res.json();
      setAdminVendors(data);
    } catch (error) {
      console.error("Failed to fetch admin vendors:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      const content = reportService.generateComplianceSummary(
        "Amara the Food Seller",
        recentActivity.filter(r => (r as any).type === 'tax') as TaxRecord[],
        recentActivity.filter(r => (r as any).type === 'levy') as LevyRecord[],
        healthPermit
      );
      setReportContent(content);
    }
    if (activeTab === 'profile' && userRole === 'ADMIN') {
      fetchAdminVendors();
    }
  }, [activeTab, userRole]);

  const handleLogTurnover = async () => {
    if (!turnoverAmount || isNaN(Number(turnoverAmount))) return;
    setIsLoading(true);
    try {
      await logTurnoverUseCase.execute(VENDOR_ID, LGA_ID, Number(turnoverAmount));
      setTurnoverAmount('');
      setShowLogModal(false);
      fetchActivity();
    } catch (error) {
      console.error("Failed to log turnover:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogLevy = async () => {
    if (!levyAmount || isNaN(Number(levyAmount))) return;
    setIsLoading(true);
    try {
      await logLevyUseCase.execute(VENDOR_ID, LGA_ID, Number(levyAmount), levyCategory);
      setLevyAmount('');
      setShowLevyModal(false);
      fetchActivity();
    } catch (error) {
      console.error("Failed to log levy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHealth = async () => {
    if (!permitNumber || !expiryDate) return;
    setIsLoading(true);
    try {
      await updateHealthPermitUseCase.execute(VENDOR_ID, permitNumber, new Date(expiryDate));
      setPermitNumber('');
      setExpiryDate('');
      setShowHealthModal(false);
      fetchHealthPermit();
    } catch (error) {
      console.error("Failed to update health permit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Wallet },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-bottom border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
            <ShieldCheck size={24} />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Compliance Wallet</h1>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Welcome Section */}
              <section className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900">Welcome Home</h2>
                <p className="text-slate-500 italic flex items-center gap-2">
                  <Languages size={16} className="text-emerald-600" />
                  {pidginWelcome}
                </p>
              </section>

              {/* Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="flex flex-col items-center justify-center py-6 gap-2 border-emerald-100 bg-emerald-50/30">
                  <CheckCircle2 className="text-emerald-600" size={32} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Tax Status</span>
                  <span className="text-sm font-bold text-emerald-900">Compliant</span>
                </Card>
                <Card 
                  className={`flex flex-col items-center justify-center py-6 gap-2 border-amber-100 cursor-pointer transition-all hover:bg-amber-50/50 ${healthPermit?.status === 'EXPIRED' ? 'bg-red-50/30 border-red-100' : 'bg-amber-50/30'}`}
                  onClick={() => setShowHealthModal(true)}
                >
                  <AlertCircle className={healthPermit?.status === 'EXPIRED' ? 'text-red-600' : 'text-amber-600'} size={32} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Health Permit</span>
                  <span className="text-sm font-bold text-amber-900">
                    {healthPermit ? (healthPermit.status === 'EXPIRED' ? 'Expired' : 'Compliant') : 'Not Set'}
                  </span>
                </Card>
              </div>

              {/* Quick Actions */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    className="w-full justify-between py-4 h-auto" 
                    variant="primary"
                    onClick={() => setShowLogModal(true)}
                  >
                    <div className="flex items-center gap-3">
                      <Plus size={20} />
                      <div className="text-left">
                        <div className="font-bold">Log Daily Turnover</div>
                        <div className="text-xs opacity-80">Record your sales for today</div>
                      </div>
                    </div>
                  </Button>
                  <Button 
                    className="w-full justify-between py-4 h-auto" 
                    variant="secondary"
                    onClick={() => setShowLevyModal(true)}
                  >
                    <div className="flex items-center gap-3">
                      <History size={20} />
                      <div className="text-left">
                        <div className="font-bold">Log New Levy</div>
                        <div className="text-xs opacity-80">Record task force payments</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </section>

              {/* Recent Activity */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Recent Activity</h3>
                  <button className="text-xs font-bold text-emerald-600 uppercase tracking-wider">View All</button>
                </div>
                <div className="space-y-3">
                  {recentActivity.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm italic">No activity recorded yet.</div>
                  )}
                  {recentActivity.map((record: any) => (
                    <Card key={record.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.type === 'tax' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {record.type === 'tax' ? <Wallet size={20} /> : <History size={20} />}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{record.type === 'tax' ? 'Daily Turnover' : record.category}</div>
                          <div className="text-xs text-slate-400">{new Date(record.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${record.type === 'tax' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          +₦{(record.turnover_amount || record.amount || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Synced</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Compliance Reports</h2>
              <Card className="p-0 overflow-hidden">
                <div className="bg-slate-900 text-white p-6 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {reportContent}
                </div>
                <div className="p-4 bg-white border-t border-slate-100">
                  <Button className="w-full gap-2" onClick={() => window.print()}>
                    <FileText size={18} />
                    Download PDF Summary
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                  <UserIcon size={40} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Amara the Food Seller</h2>
                  <p className="text-slate-500 text-sm">Mile 3 Market, Port Harcourt</p>
                </div>
              </div>

              {userRole === 'ADMIN' && (
                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Admin: Vendor Directory</h3>
                  <div className="space-y-3">
                    {adminVendors.map((v) => (
                      <Card key={v.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-bold">{v.name}</div>
                          <div className="text-xs text-slate-500">{v.phone_number}</div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                          {v.registration_status || 'Active'}
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Account Settings</h3>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Languages size={18} />
                  Change Language (Pidgin/English)
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 text-red-600 border-red-100 hover:bg-red-50">
                  <X size={18} />
                  Delete My Account
                </Button>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Log Turnover Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Log Turnover</h2>
                <button onClick={() => setShowLogModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Amount (₦)</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={turnoverAmount}
                    onChange={(e) => setTurnoverAmount(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-emerald-600 mt-0.5" size={18} />
                    <div className="text-sm text-emerald-800">
                      Your tax will be calculated automatically based on your LGA band.
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full py-4 text-lg" 
                  onClick={handleLogTurnover}
                  disabled={isLoading || !turnoverAmount}
                >
                  {isLoading ? 'Processing...' : 'Confirm Entry'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Levy Modal */}
      <AnimatePresence>
        {showLevyModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLevyModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Log New Levy</h2>
                <button onClick={() => setShowLevyModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Amount (₦)</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 500" 
                    value={levyAmount}
                    onChange={(e) => setLevyAmount(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Category</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={levyCategory}
                    onChange={(e) => setLevyCategory(e.target.value)}
                  >
                    <option>Market Levy</option>
                    <option>Security Fee</option>
                    <option>Waste Management</option>
                    <option>Task Force Settlement</option>
                  </select>
                </div>

                <Button 
                  className="w-full py-4 text-lg" 
                  variant="secondary"
                  onClick={handleLogLevy}
                  disabled={isLoading || !levyAmount}
                >
                  {isLoading ? 'Processing...' : 'Record Payment'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Health Permit Modal */}
      <AnimatePresence>
        {showHealthModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHealthModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Health Permit</h2>
                <button onClick={() => setShowHealthModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Permit Number</label>
                  <Input 
                    placeholder="e.g. PH-2024-001" 
                    value={permitNumber}
                    onChange={(e) => setPermitNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Expiry Date</label>
                  <Input 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full py-4 text-lg" 
                  onClick={handleUpdateHealth}
                  disabled={isLoading || !permitNumber || !expiryDate}
                >
                  {isLoading ? 'Updating...' : 'Save Permit'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voice Guidance Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Mic size={24} />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-3 flex items-center justify-around z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
              activeTab === tab.id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-white z-[70] shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-xl">Settings</h2>
                <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Role (Demo Only)</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant={userRole === 'VENDOR' ? 'primary' : 'outline'} onClick={() => setUserRole('VENDOR')}>Vendor</Button>
                    <Button size="sm" variant={userRole === 'ADMIN' ? 'primary' : 'outline'} onClick={() => setUserRole('ADMIN')}>Admin</Button>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Language</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary">Pidgin</Button>
                    <Button size="sm" variant="outline">English</Button>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Account</div>
                  <div className="text-sm font-medium">Amara the Food Seller</div>
                  <div className="text-xs text-slate-500">+234 801 234 5678</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

