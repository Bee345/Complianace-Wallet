import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, CheckCircle2, Loader2, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../../types';
import { PidginVoice } from '../PidginVoice';

interface TaxLoggingViewProps {
  user: User;
  onComplete: () => void;
}

export const TaxLoggingView: React.FC<TaxLoggingViewProps> = ({ user, onComplete }) => {
  const [turnover, setTurnover] = useState('');
  const [lgaBands, setLgaBands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBands, setIsFetchingBands] = useState(true);

  useEffect(() => {
    const fetchBands = async () => {
      try {
        const res = await fetch('/api/lga-bands');
        if (res.ok) setLgaBands(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setIsFetchingBands(false);
      }
    };
    fetchBands();
  }, []);

  const handleLogTax = async () => {
    if (!user || !turnover) return;
    setIsLoading(true);
    const amount = parseFloat(turnover);
    
    const band = lgaBands.find(b => amount >= b.min_turnover && amount <= b.max_turnover) || lgaBands[0];
    const tax = band?.daily_tax || 0;
    
    try {
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
          description: `Daily Tax (${band?.name || 'Standard'})`
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
          'x-user-role': 'VENDOR',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          id: `tax-${Date.now()}`,
          vendorId: user.id,
          date: new Date().toISOString(),
          turnover: { amount },
          calculatedTax: { amount: tax },
          lgaBandId: band?.id
        })
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to log tax:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingBands) return <div className="flex justify-center p-12"><Loader2 className="animate-spin opacity-20" size={48} /></div>;

  const amount = parseFloat(turnover || '0');
  const band = lgaBands.find(b => amount >= b.min_turnover && amount <= b.max_turnover) || lgaBands[0];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-serif italic">Log Daily Turnover</h2>
        <p className="text-xs font-mono uppercase opacity-50 tracking-widest">Keep your compliance score high</p>
      </div>

      <div className="bg-white border border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
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
            className="w-full text-6xl font-mono border-none focus:ring-0 p-0 placeholder:opacity-10"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1000, 5000, 10000, 20000, 50000, 100000].map(amt => (
            <button 
              key={amt} 
              onClick={() => setTurnover(amt.toString())}
              className="py-4 border border-[#141414] font-mono text-xs hover:bg-[#141414] hover:text-white transition-all"
            >
              ₦{amt >= 1000 ? `${amt/1000}k` : amt}
            </button>
          ))}
        </div>

        <div className="pt-8 border-t border-[#141414] space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase opacity-50 block">Calculated Tax</span>
              <span className="text-sm font-serif italic">{band?.name || 'Standard Band'}</span>
            </div>
            <span className="text-3xl font-mono">₦{band?.daily_tax || 0}</span>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 p-6 flex items-start gap-4">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-emerald-900 uppercase">Compliance Tip</h4>
              <p className="text-xs leading-relaxed text-emerald-800 italic">
                "Amara, this tax go help you get loan from Microfinance Bank later. Keep am up!"
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogTax}
            disabled={isLoading || !turnover}
            className="w-full bg-[#141414] text-white py-6 font-mono uppercase tracking-[0.2em] hover:bg-opacity-90 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : <><Calculator size={20} /> Pay from Wallet</>}
          </button>
        </div>
      </div>
    </div>
  );
};
