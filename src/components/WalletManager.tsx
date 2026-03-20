import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, History, Loader2, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WalletManagerProps {
  userId: string;
  onPaymentSuccess?: () => void;
}

export const WalletManager: React.FC<WalletManagerProps> = ({ userId, onPaymentSuccess }) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('1000');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBalance = async () => {
    try {
      const res = await fetch(`/api/wallet/${userId}`, {
        headers: { 'x-user-role': 'VENDOR', 'x-user-id': userId }
      });
      const data = await res.json();
      setBalance(data.balance);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userId]);

  const handleTopup = async () => {
    setIsProcessing(true);
    try {
      await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'VENDOR',
          'x-user-id': userId
        },
        body: JSON.stringify({ userId, amount: parseFloat(topupAmount) })
      });
      await fetchBalance();
      setIsTopupOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-[#141414] text-white p-8 border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -translate-y-16 translate-x-16 rounded-full" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-60">
              <Wallet size={16} />
              <span className="text-[10px] font-mono uppercase tracking-widest">Compliance Wallet Balance</span>
            </div>
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <ArrowUpRight size={14} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-serif italic opacity-50">₦</span>
              <h2 className="text-5xl font-mono font-bold tracking-tighter">
                {isLoading ? '---' : balance.toLocaleString()}
              </h2>
            </div>
            <p className="text-[10px] font-mono uppercase opacity-40 italic">"Safe money for your business formalization"</p>
          </div>

          <button 
            onClick={() => setIsTopupOpen(true)}
            className="w-full py-3 bg-white text-[#141414] font-mono text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all"
          >
            <Plus size={14} /> Top Up Wallet
          </button>
        </div>
      </div>

      {/* Topup Modal */}
      <AnimatePresence>
        {isTopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm"
              onClick={() => setIsTopupOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white border-2 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] p-8"
            >
              <h3 className="text-2xl font-serif italic mb-6">Top Up Wallet</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Select Amount (₦)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['500', '1000', '5000'].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setTopupAmount(amt)}
                        className={`py-2 border border-[#141414] font-mono text-[10px] uppercase transition-all ${
                          topupAmount === amt ? 'bg-[#141414] text-white' : 'hover:bg-[#f5f5f5]'
                        }`}
                      >
                        ₦{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Custom Amount</label>
                  <input 
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="w-full text-2xl font-mono border-b border-[#141414] p-2 focus:ring-0"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
                  <Info size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-[10px] leading-relaxed text-blue-800 italic">
                    "This top-up go use your saved card or bank transfer. Safe and secure."
                  </p>
                </div>

                <button 
                  onClick={handleTopup}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#141414] text-white font-mono text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {isProcessing ? 'Processing...' : 'Confirm Top Up'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
