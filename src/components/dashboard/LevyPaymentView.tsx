import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, Receipt, Loader2, AlertCircle, CheckCircle2, ChevronRight, MapPin, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';

interface LevyPaymentViewProps {
  user: User;
}

export const LevyPaymentView: React.FC<LevyPaymentViewProps> = ({ user }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedLevy, setSelectedLevy] = useState<any | null>(null);

  const levies = [
    { id: 'env', name: 'Environmental Sanitation', amount: 500, category: 'Sanitation', icon: ShieldCheck },
    { id: 'trade', name: 'Trade License Renewal', amount: 1200, category: 'Licensing', icon: Receipt },
    { id: 'market', name: 'Market Stall Fee', amount: 200, category: 'Market', icon: MapPin },
    { id: 'health', name: 'Health Inspection Fee', amount: 800, category: 'Health', icon: ShieldCheck },
  ];

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch(`/api/wallet/${user.id}`, {
          headers: { 'x-user-role': 'VENDOR', 'x-user-id': user.id }
        });
        const data = await res.json();
        setWalletBalance(data.balance);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWallet();
  }, [user.id]);

  const handlePay = async () => {
    if (!selectedLevy) return;
    setIsPaying(true);
    try {
      const response = await fetch('/api/wallet/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'VENDOR',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          userId: user.id,
          amount: selectedLevy.amount,
          description: selectedLevy.name
        })
      });

      if (response.ok) {
        // Record levy
        await fetch('/api/levy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'VENDOR',
            'x-user-id': user.id
          },
          body: JSON.stringify({
            id: `levy-${Date.now()}`,
            vendorId: user.id,
            date: new Date().toISOString(),
            amount: { amount: selectedLevy.amount, currency: 'NGN' },
            lgaId: user.lga || 'Port Harcourt',
            category: selectedLevy.category,
            receiptPhotoUrl: null
          })
        });

        setWalletBalance(prev => prev - selectedLevy.amount);
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentSuccess(false);
          setSelectedLevy(null);
        }, 3000);
      } else {
        const err = await response.json();
        alert(err.error || 'Payment failed');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin opacity-20" size={48} /></div>;

  return (
    <div className="space-y-12 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-serif italic">LGA Levies & Payments</h2>
          <p className="text-xs font-mono uppercase opacity-50 tracking-widest">Official Government Fee Portal</p>
        </div>
        <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] min-w-[200px]">
          <div className="text-[10px] font-mono uppercase opacity-50 mb-1">Wallet Balance</div>
          <div className="text-2xl font-mono">₦{walletBalance.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levies.map((levy, idx) => (
          <motion.div 
            key={levy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col justify-between group hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] transition-all"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-[#E4E3E0] border border-[#141414]">
                  <levy.icon size={24} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase opacity-50">Amount</div>
                  <div className="text-xl font-mono">₦{levy.amount}</div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-serif italic">{levy.name}</h3>
                <p className="text-[10px] font-mono uppercase opacity-50">{levy.category} • Annual Fee</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedLevy(levy)}
              className="mt-6 w-full py-3 border border-[#141414] font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#141414] hover:text-white transition-all"
            >
              Pay Now <ChevronRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {selectedLevy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPaying && setSelectedLevy(null)}
              className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white border border-[#141414] w-full max-w-md shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] overflow-hidden"
            >
              {paymentSuccess ? (
                <div className="p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif italic">Payment Successful!</h3>
                    <p className="text-xs font-mono opacity-50 uppercase tracking-widest">Receipt generated in your dashboard</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-8 border-b border-[#141414] bg-[#f9f9f9]">
                    <h3 className="text-2xl font-serif italic mb-1">Confirm Payment</h3>
                    <p className="text-[10px] font-mono uppercase opacity-50 tracking-widest">Authorize LGA Levy Deduction</p>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center p-4 border border-[#141414] border-dashed">
                      <div className="text-xs font-mono uppercase opacity-50">{selectedLevy.name}</div>
                      <div className="text-xl font-mono">₦{selectedLevy.amount}</div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="opacity-50 uppercase">Current Balance</span>
                        <span>₦{walletBalance}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span className="uppercase">Remaining Balance</span>
                        <span>₦{walletBalance - selectedLevy.amount}</span>
                      </div>
                    </div>

                    {walletBalance < selectedLevy.amount ? (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-600 flex gap-3 items-start">
                        <AlertCircle size={18} className="shrink-0" />
                        <div className="text-[10px] font-mono uppercase">Insufficient balance. Please top up your wallet first.</div>
                      </div>
                    ) : (
                      <button 
                        onClick={handlePay}
                        disabled={isPaying}
                        className="w-full py-4 bg-[#141414] text-white font-mono uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all disabled:opacity-50"
                      >
                        {isPaying ? <Loader2 className="animate-spin" size={20} /> : <><Wallet size={20} /> Pay from Wallet</>}
                      </button>
                    )}
                    
                    <button 
                      onClick={() => setSelectedLevy(null)}
                      disabled={isPaying}
                      className="w-full py-4 border border-[#141414] font-mono uppercase tracking-widest hover:bg-[#f5f5f5] transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
