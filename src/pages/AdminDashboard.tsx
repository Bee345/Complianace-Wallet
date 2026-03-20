import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { 
  ShieldCheck, 
  Users, 
  FileCheck, 
  BarChart3, 
  Settings, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Clock,
  LogOut,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
  Camera
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
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CAC_QUEUE' | 'ANALYTICS'>('OVERVIEW');
  const [stats, setStats] = useState<any | null>(null);
  const [cacQueue, setCacQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [statsRes, queueRes] = await Promise.all([
          fetch('/api/admin/stats', {
            headers: { 'x-user-role': 'ADMIN', 'x-user-id': user.id }
          }),
          fetch('/api/admin/cac-queue', {
            headers: { 'x-user-role': 'ADMIN', 'x-user-id': user.id }
          })
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (queueRes.ok) setCacQueue(await queueRes.json());
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleVerify = async (businessId: string, status: string) => {
    if (!user) return;
    try {
      const response = await fetch('/api/admin/verify-cac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'ADMIN',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          businessId,
          status,
          cacNumber: status === 'APPROVED' ? `RC-${Math.floor(Math.random() * 1000000)}` : null
        })
      });

      if (response.ok) {
        // Refresh queue
        const queueRes = await fetch('/api/admin/cac-queue', {
          headers: { 'x-user-role': 'ADMIN', 'x-user-id': user.id }
        });
        if (queueRes.ok) setCacQueue(await queueRes.json());
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const displayStats = [
    { label: 'Total Vendors', value: stats?.totalVendors || '0', trend: '+12%', icon: Users },
    { label: 'Total Businesses', value: stats?.totalBusinesses || '0', trend: '+8%', icon: BarChart3 },
    { label: 'CAC Pending', value: cacQueue.length.toString(), trend: '-5%', icon: FileCheck },
    { label: 'Compliance Rate', value: '78%', trend: '+2%', icon: ShieldCheck },
  ];

  const growthData = [
    { name: 'Oct', vendors: 400, revenue: 2400 },
    { name: 'Nov', vendors: 450, revenue: 2800 },
    { name: 'Dec', vendors: 520, revenue: 3500 },
    { name: 'Jan', vendors: 600, revenue: 3100 },
    { name: 'Feb', vendors: 750, revenue: 4200 },
    { name: 'Mar', vendors: 880, revenue: 4800 },
  ];

  const lgaData = [
    { name: 'Port Harcourt', count: 450 },
    { name: 'Obio/Akpor', count: 380 },
    { name: 'Eleme', count: 120 },
    { name: 'Oyigbo', count: 90 },
    { name: 'Ikwerre', count: 150 },
  ];

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#141414] h-screen sticky top-0">
        <div className="p-6 border-b border-[#141414] flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <span className="font-serif italic text-xl">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: BarChart3 },
            { id: 'CAC_QUEUE', label: 'CAC Verification', icon: FileCheck },
            { id: 'ANALYTICS', label: 'Market Analytics', icon: TrendingUp },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-mono uppercase tracking-wider transition-all ${
                activeTab === item.id ? 'bg-[#141414] text-white' : 'hover:bg-[#f5f5f5]'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#141414]">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-mono uppercase tracking-wider text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden sticky top-0 z-50 bg-[#E4E3E0] border-b border-[#141414] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <span className="font-serif italic text-xl">Admin</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 space-y-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-serif italic mb-2">System Control</h1>
            <p className="text-xs font-mono uppercase opacity-50">Global Dashboard • Rivers State Network</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
              <input 
                type="text" 
                placeholder="Search system..."
                className="pl-10 pr-4 py-2 border border-[#141414] bg-white font-mono text-xs focus:ring-0 outline-none w-64"
              />
            </div>
            <button className="p-2 border border-[#141414] bg-white hover:bg-[#f5f5f5]">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {activeTab === 'OVERVIEW' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayStats.map((stat, i) => (
                <div key={i} className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-[#E4E3E0]">
                      <stat.icon size={20} />
                    </div>
                    <div className={`text-[10px] font-mono ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono uppercase opacity-50 mb-1">{stat.label}</div>
                  <div className="text-3xl font-mono">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Recent CAC Requests */}
            <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              <div className="p-6 border-b border-[#141414] flex justify-between items-center">
                <h3 className="font-serif italic text-2xl">CAC Verification Queue</h3>
                <button 
                  onClick={() => setActiveTab('CAC_QUEUE')}
                  className="text-[10px] font-mono uppercase opacity-50 hover:opacity-100 flex items-center gap-2"
                >
                  View Full Queue <ChevronRight size={14} />
                </button>
              </div>
              <div className="divide-y divide-[#141414]">
                {cacQueue.length > 0 ? cacQueue.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f9f9f9] transition-colors cursor-pointer" onClick={() => setSelectedBusiness(item)}>
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-[#E4E3E0] flex items-center justify-center">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt="Shop" className="w-full h-full object-cover" />
                        ) : (
                          <FileCheck size={24} />
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-medium">{item.name}</div>
                        <div className="text-xs font-mono opacity-50 uppercase">{item.business_type || 'General'} • {item.lga_id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[10px] font-mono uppercase opacity-50">Submitted</div>
                        <div className="text-sm font-mono">{new Date(item.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleVerify(item.id, 'APPROVED')}
                          className="p-2 border border-[#141414] text-emerald-600 hover:bg-emerald-50"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleVerify(item.id, 'REJECTED')}
                          className="p-2 border border-[#141414] text-red-600 hover:bg-red-50"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-[10px] font-mono uppercase opacity-30">Queue is empty</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CAC_QUEUE' && (
          <div className="bg-white border border-[#141414] p-12 text-center space-y-4">
            <FileCheck size={48} className="mx-auto opacity-20" />
            <h3 className="text-2xl font-serif italic">Full Verification Queue</h3>
            <p className="text-sm font-mono opacity-50 max-w-md mx-auto">
              This section allows bulk verification of CAC documents submitted by vendors. 
              Each submission includes business name, address, and photo proof.
            </p>
          </div>
        )}

        {activeTab === 'ANALYTICS' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <h3 className="font-serif italic text-2xl mb-8">Vendor Growth Trend</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="colorVendors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ border: '1px solid #141414', borderRadius: '0', fontFamily: 'monospace' }}
                      />
                      <Area type="monotone" dataKey="vendors" stroke="#141414" fillOpacity={1} fill="url(#colorVendors)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <h3 className="font-serif italic text-2xl mb-8">Registration by LGA</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lgaData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontFamily: 'monospace' }}
                        width={100}
                      />
                      <Tooltip 
                        contentStyle={{ border: '1px solid #141414', borderRadius: '0', fontFamily: 'monospace' }}
                      />
                      <Bar dataKey="count" fill="#141414" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#141414] p-12 text-center space-y-4">
              <TrendingUp size={48} className="mx-auto opacity-20" />
              <h3 className="text-2xl font-serif italic">Advanced System Metrics</h3>
              <p className="text-sm font-mono opacity-50 max-w-md mx-auto">
                Real-time monitoring of tax collection efficiency and vendor compliance heatmaps.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-[#E4E3E0] p-8 flex flex-col md:hidden"
          >
            <div className="flex justify-end mb-12">
              <button onClick={() => setIsMenuOpen(false)} className="p-2 border border-[#141414]">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-8 flex-1">
              <button onClick={() => { setActiveTab('OVERVIEW'); setIsMenuOpen(false); }} className="w-full text-left text-4xl font-serif italic">Overview</button>
              <button onClick={() => { setActiveTab('CAC_QUEUE'); setIsMenuOpen(false); }} className="w-full text-left text-4xl font-serif italic">CAC Queue</button>
              <button onClick={() => { setActiveTab('ANALYTICS'); setIsMenuOpen(false); }} className="w-full text-left text-4xl font-serif italic">Analytics</button>
              <button className="w-full text-left text-4xl font-serif italic">System Logs</button>
            </div>
            <button 
              onClick={logout}
              className="w-full py-4 border border-[#141414] font-mono uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Business Details Modal */}
      <AnimatePresence>
        {selectedBusiness && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBusiness(null)}
              className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white border border-[#141414] w-full max-w-2xl shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-[#141414]">
                <h3 className="text-2xl font-serif italic">Verification Details</h3>
                <button onClick={() => setSelectedBusiness(null)} className="p-2 hover:bg-[#f5f5f5]">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Business Name</label>
                    <div className="text-xl font-medium">{selectedBusiness.name}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Type & Location</label>
                    <div className="text-sm font-mono">{selectedBusiness.business_type} • {selectedBusiness.lga_id}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Address</label>
                    <div className="text-sm italic">"{selectedBusiness.address || 'No address provided'}"</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Vendor Name</label>
                    <div className="text-sm font-mono">{selectedBusiness.vendor_name}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-mono uppercase opacity-50 block mb-1">Shop Front Proof</label>
                  <div className="aspect-video bg-[#E4E3E0] border border-[#141414] overflow-hidden">
                    {selectedBusiness.photo_url ? (
                      <img src={selectedBusiness.photo_url} alt="Shop Front" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Camera size={48} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#f9f9f9] border-t border-[#141414] flex justify-end gap-4">
                <button 
                  onClick={() => { handleVerify(selectedBusiness.id, 'REJECTED'); setSelectedBusiness(null); }}
                  className="px-6 py-3 border border-[#141414] text-red-600 font-mono text-xs uppercase hover:bg-red-50 transition-all"
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => { handleVerify(selectedBusiness.id, 'APPROVED'); setSelectedBusiness(null); }}
                  className="px-6 py-3 bg-[#141414] text-white font-mono text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all"
                >
                  Approve & Issue CAC
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
