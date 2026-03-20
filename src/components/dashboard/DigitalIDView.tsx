import React from 'react';
import { ShieldCheck, User, MapPin, Award, QrCode, Download, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { User as UserType, Business } from '../../types';

interface DigitalIDViewProps {
  user: UserType;
  business?: Business | null;
}

export const DigitalIDView: React.FC<DigitalIDViewProps> = ({ user, business }) => {
  const cardId = `RV-${user.id.slice(-6).toUpperCase()}`;
  
  return (
    <div className="space-y-12 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-serif italic">Digital Vendor ID</h2>
        <p className="text-xs font-mono uppercase opacity-50 tracking-widest">Official Rivers State Compliance Identity</p>
      </div>

      {/* ID Card */}
      <motion.div 
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative aspect-[1.586/1] w-full bg-white border-2 border-[#141414] shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#141414] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-400" />
            <span className="text-[10px] font-mono uppercase tracking-tighter">Rivers State Government • Compliance Wallet</span>
          </div>
          <div className="text-[8px] font-mono opacity-50 uppercase">Exp: 12/2026</div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 flex gap-8">
          {/* Photo & QR */}
          <div className="space-y-4">
            <div className="w-32 h-32 bg-[#E4E3E0] border border-[#141414] overflow-hidden">
              {user.profile_photo_url ? (
                <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <User size={48} />
                </div>
              )}
            </div>
            <div className="w-32 h-32 border border-[#141414] p-2 flex items-center justify-center bg-white">
              <QrCode size={100} strokeWidth={1.5} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-[8px] font-mono uppercase opacity-50 block">Vendor Name</label>
              <div className="text-2xl font-serif italic leading-tight">{user.name}</div>
            </div>

            <div>
              <label className="text-[8px] font-mono uppercase opacity-50 block">Business Name</label>
              <div className="text-sm font-medium">{business?.name || 'Individual Vendor'}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[8px] font-mono uppercase opacity-50 block">LGA / Zone</label>
                <div className="text-[10px] font-mono flex items-center gap-1">
                  <MapPin size={10} /> {user.lga || 'Port Harcourt'}
                </div>
              </div>
              <div>
                <label className="text-[8px] font-mono uppercase opacity-50 block">CAC Status</label>
                <div className="text-[10px] font-mono flex items-center gap-1">
                  <Award size={10} className={business?.registration_status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'} />
                  {business?.registration_status || 'NOT REGISTERED'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#141414] border-dashed">
              <div className="text-[10px] font-mono tracking-widest font-bold">{cardId}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#141414] flex justify-between items-center bg-[#f9f9f9]">
          <div className="text-[8px] font-mono opacity-50 italic">"This ID confirms say you be verified vendor for Rivers State."</div>
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-[#141414] rounded-full" />
            <div className="w-6 h-6 bg-emerald-500 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="py-4 border border-[#141414] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#141414] hover:text-white transition-all">
          <Download size={16} /> Download PDF
        </button>
        <button className="py-4 border border-[#141414] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#141414] hover:text-white transition-all">
          <Share2 size={16} /> Share ID
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 flex gap-4 items-start">
        <ShieldCheck className="text-amber-600 shrink-0" size={24} />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Official Use Only</h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            Show this ID to LGA officials or Task Force members if dem ask for your compliance proof. 
            Dem fit scan the QR code to verify your status in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};
