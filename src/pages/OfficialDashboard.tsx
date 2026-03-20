import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { 
  Search, 
  Scan, 
  ShieldCheck, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  MapPin,
  LogOut,
  Menu,
  X,
  FileText,
  User,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { LGAAnalyticsView } from '../components/dashboard/LGAAnalyticsView';
import { TaxBandManagerView } from '../components/dashboard/TaxBandManagerView';

type OfficialView = 'LIST' | 'ANALYTICS' | 'TAX_BANDS' | 'SETTINGS' | 'SUPPORT';

export const OfficialDashboard: React.FC = () => {
  const { user, logout } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<OfficialView>('LIST');

  const complianceData = [
    { name: 'Compliant', value: 82, color: '#10b981' },
    { name: 'Pending', value: 12, color: '#f59e0b' },
    { name: 'Non-Compliant', value: 6, color: '#ef4444' },
  ];

  const revenueData = [
    { month: 'Oct', revenue: 4200000 },
    { month: 'Nov', revenue: 4800000 },
    { month: 'Dec', revenue: 5600000 },
    { month: 'Jan', revenue: 5100000 },
    { month: 'Feb', revenue: 6200000 },
    { month: 'Mar', revenue: 6800000 },
  ];

  useEffect(() => {
    const fetchVendors = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/vendors', { // Using admin endpoint for demo simplicity
          headers: {
            'x-user-role': user.role || 'OFFICIAL',
            'x-user-id': user.id
          }
        });
        if (response.ok) {
          const data = await response.json();
          setVendors(data);
        }
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, [user]);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.id.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-[#E4E3E0] border-b border-[#141414] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <span className="font-serif italic text-xl">Official Portal</span>
        </div>
        
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-white border border-transparent hover:border-[#141414] transition-all"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-serif italic mb-2">LGA Compliance</h2>
            <p className="text-xs font-mono uppercase opacity-50 flex items-center gap-2">
              <MapPin size={12} /> Port Harcourt City Council • Area 1
            </p>
          </div>
          <div className="flex gap-2 bg-white border border-[#141414] p-1">
            <button 
              onClick={() => setView('LIST')}
              className={`px-4 py-2 font-mono text-[10px] uppercase transition-all ${view === 'LIST' ? 'bg-[#141414] text-white' : 'hover:bg-[#f5f5f5]'}`}
            >
              Vendor List
            </button>
            <button 
              onClick={() => setView('ANALYTICS')}
              className={`px-4 py-2 font-mono text-[10px] uppercase transition-all ${view === 'ANALYTICS' ? 'bg-[#141414] text-white' : 'hover:bg-[#f5f5f5]'}`}
            >
              Analytics
            </button>
          </div>
        </div>

        {view === 'ANALYTICS' ? (
          <LGAAnalyticsView />
        ) : view === 'TAX_BANDS' ? (
          <TaxBandManagerView />
        ) : view === 'SETTINGS' ? (
          <div className="text-center py-20 opacity-30 font-mono uppercase text-xs">Official Settings Coming Soon</div>
        ) : view === 'SUPPORT' ? (
          <div className="text-center py-20 opacity-30 font-mono uppercase text-xs">Official Support Coming Soon</div>
        ) : (
          <>
            {/* Search & Verify */}
            <div className="bg-white border border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search Vendor by Name, Phone or CAC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-[#141414] font-mono text-sm focus:ring-0 outline-none"
                  />
                </div>
                <button className="bg-[#141414] text-white px-8 py-4 font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
                  <Scan size={20} /> Scan QR
                </button>
              </div>

              <div className="flex gap-2">
                {['All', 'Compliant', 'Pending', 'Expired'].map(f => (
                  <button key={f} className="px-4 py-2 border border-[#141414] text-[10px] font-mono uppercase hover:bg-[#141414] hover:text-white transition-all">
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Vendor List */}
            <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
              <div className="p-4 border-b border-[#141414] bg-[#f9f9f9] flex justify-between items-center">
                <h3 className="font-serif italic text-lg">Registered Vendors</h3>
                <Filter size={18} className="opacity-30" />
              </div>
              <div className="divide-y divide-[#141414]">
                {filteredVendors.length > 0 ? filteredVendors.map((vendor) => (
                  <div 
                    key={vendor.id} 
                    onClick={() => setSelectedVendor(vendor)}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#f5f5f5] cursor-pointer transition-colors"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-[#E4E3E0] flex items-center justify-center text-[#141414]">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="text-lg font-medium">{vendor.name}</div>
                        <div className="text-xs font-mono opacity-50 uppercase">{vendor.business_name || 'No Business'} • {vendor.id}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden md:block">
                        <div className="text-[10px] font-mono uppercase opacity-50">Registration</div>
                        <div className="text-sm font-mono">{vendor.registration_status || 'NOT STARTED'}</div>
                      </div>
                      
                      <div className={`px-3 py-1 text-[10px] font-mono border flex items-center gap-2 ${
                        vendor.registration_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        vendor.registration_status === 'SUBMITTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {vendor.registration_status === 'VERIFIED' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {vendor.registration_status || 'UNREGISTERED'}
                      </div>
                      
                      <ChevronRight size={20} className="opacity-20" />
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-[10px] font-mono uppercase opacity-30">No vendors found</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Vendor Detail Modal */}
      <AnimatePresence>
        {selectedVendor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-[#141414]/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white border border-[#141414] w-full max-w-2xl p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-[#E4E3E0] flex items-center justify-center">
                    <User size={40} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif italic">{selectedVendor.name}</h3>
                    <p className="text-sm font-mono opacity-50">{selectedVendor.business_name || 'No Business'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedVendor(null)} className="p-2 border border-[#141414] hover:bg-[#f5f5f5]">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 border-b border-[#141414] pb-2">Business Details</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-50">LGA:</span>
                      <span className="font-medium">{selectedVendor.lga}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-50">CAC Status:</span>
                      <span className="text-emerald-600 font-bold">VERIFIED</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-50">Phone:</span>
                      <span className="font-mono">{selectedVendor.id}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 border-b border-[#141414] pb-2">Compliance Status</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-50">Tax (Mar 2026):</span>
                      <span className="text-emerald-600 font-bold">PAID (₦12,400)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-50">Health Permit:</span>
                      <span className="text-amber-600 font-bold">EXPIRES IN 14D</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-50">Market Levies:</span>
                      <span className="text-emerald-600 font-bold">CURRENT</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-[#141414] text-white py-4 font-mono uppercase tracking-widest hover:bg-opacity-90 transition-all">
                  Issue Warning
                </button>
                <button className="flex-1 border border-[#141414] py-4 font-mono uppercase tracking-widest hover:bg-[#f5f5f5] transition-all">
                  Print Certificate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 z-[60] bg-[#E4E3E0] p-8 flex flex-col"
          >
            <div className="flex justify-end mb-12">
              <button onClick={() => setIsMenuOpen(false)} className="p-2 border border-[#141414]">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-8 flex-1">
              <button 
                onClick={() => { setView('ANALYTICS'); setIsMenuOpen(false); }}
                className="w-full text-left text-4xl font-serif italic hover:translate-x-4 transition-transform"
              >
                LGA Analytics
              </button>
              <button 
                onClick={() => { setView('TAX_BANDS'); setIsMenuOpen(false); }}
                className="w-full text-left text-4xl font-serif italic hover:translate-x-4 transition-transform"
              >
                Tax Band Manager
              </button>
              <button 
                onClick={() => { setView('SETTINGS'); setIsMenuOpen(false); }}
                className="w-full text-left text-4xl font-serif italic hover:translate-x-4 transition-transform"
              >
                Official Settings
              </button>
              <button 
                onClick={() => { setView('SUPPORT'); setIsMenuOpen(false); }}
                className="w-full text-left text-4xl font-serif italic hover:translate-x-4 transition-transform"
              >
                Support
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
