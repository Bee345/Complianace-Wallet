import React, { useState } from 'react';
import { useUser } from '../UserContext';
import { UserRole } from '../types';
import { ShieldCheck, ArrowRight, Info, User, Mail, Lock, Phone, Calendar, MapPin, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthPageProps {
  onBack?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const { login, register, isLoading } = useUser();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<UserRole>('VENDOR');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    identifier: '', // email, username or phone
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    email: '',
    username: '',
    name: '',
    firstName: '',
    lastName: '',
    dob: '',
    state: 'Rivers',
    lga: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.identifier, formData.password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await register({
        ...formData,
        role: isAdminMode ? 'ADMIN' : role
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex flex-col items-center justify-center p-6 relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-all"
        >
          <ChevronLeft size={16} /> Back to Home
        </button>
      )}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#141414] text-white mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-serif italic mb-2">Compliance Wallet</h1>
          <p className="text-xs font-mono uppercase opacity-50">
            {isAdminMode ? 'Secure Admin Terminal' : 'Secure Access for Micro-Sellers'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-mono flex items-center gap-2">
            <Info size={14} /> {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'LOGIN' ? (
            <motion.form 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin} 
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest opacity-50 block">Identifier (Email/Username/Phone)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                    <input
                      name="identifier"
                      type="text"
                      placeholder="Enter your login ID"
                      value={formData.identifier}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-[#141414] font-mono focus:ring-0 focus:border-[#141414] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest opacity-50 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                    <input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-[#141414] font-mono focus:ring-0 focus:border-[#141414] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#141414] text-white py-4 font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Sign In'} <ArrowRight size={18} />
              </button>

              <div className="flex justify-between items-center">
                <button 
                  type="button"
                  onClick={() => setMode('REGISTER')}
                  className="text-[10px] font-mono uppercase opacity-50 hover:opacity-100"
                >
                  Create New Account
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className="text-[10px] font-mono uppercase opacity-20 hover:opacity-100"
                >
                  {isAdminMode ? 'Standard User' : 'Admin Access'}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister} 
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <button type="button" onClick={() => setMode('LOGIN')} className="p-2 hover:bg-gray-100">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-serif italic">Create Account</h2>
              </div>

              {!isAdminMode && (
                <div className="space-y-4">
                  <label className="text-[10px] font-mono uppercase tracking-widest opacity-50 block">Select Your Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['VENDOR', 'OFFICIAL'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 text-[10px] font-mono border border-[#141414] transition-all ${role === r ? 'bg-[#141414] text-white' : 'hover:bg-[#f5f5f5]'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">Display Name / Business Name</label>
                  <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" placeholder="e.g. Amara the Food Seller" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">First Name (Optional)</label>
                  <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">Last Name (Optional)</label>
                  <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">Username</label>
                  <input name="username" type="text" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">Phone Number</label>
                  <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">Date of Birth</label>
                  <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">State</label>
                  <input name="state" type="text" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">LGA</label>
                  <select name="lga" value={formData.lga} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none bg-white" required>
                    <option value="">Select LGA</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Obio/Akpor">Obio/Akpor</option>
                    <option value="Eleme">Eleme</option>
                    <option value="Oyigbo">Oyigbo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">Password</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase opacity-50 block">Confirm Password</label>
                  <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border border-[#141414] font-mono text-sm outline-none" required />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#141414] text-white py-4 font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Register Now'} <ArrowRight size={18} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-8 border-t border-[#141414] flex items-start gap-3 opacity-50">
          <Info size={16} className="shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed">
            By entering, you agree to the Street Vendor Compliance Wallet terms. 
            We use secure auth to keep your business records secure and offline-ready.
          </p>
        </div>
      </motion.div>

      <div className="mt-8 text-[10px] font-mono uppercase opacity-30 tracking-[0.2em]">
        Port Harcourt City Council • CAC Integrated
      </div>
    </div>
  );
};
