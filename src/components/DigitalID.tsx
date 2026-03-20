import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Business } from '../types';
import { Shield, CheckCircle2, MapPin, User as UserIcon } from 'lucide-react';

interface DigitalIDProps {
  user: User;
  business?: Business;
  complianceStatus: 'COMPLIANT' | 'PENDING' | 'EXPIRED';
}

export const DigitalID: React.FC<DigitalIDProps> = ({ user, business, complianceStatus }) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const qrData = JSON.stringify({
    id: user.id,
    name: fullName,
    business: business?.name,
    status: complianceStatus,
    verifyUrl: `${window.location.origin}/verify/${user.id}`
  });

  return (
    <div className="w-full max-w-sm mx-auto bg-white border-2 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
      {/* Header */}
      <div className="bg-[#141414] p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-yellow-400" />
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Compliance Wallet ID</span>
        </div>
        <div className="text-[8px] font-mono opacity-50">VERIFIED BY RIVERS STATE</div>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-[#141414] flex gap-4">
        <div className="w-20 h-20 bg-[#E4E3E0] border border-[#141414] flex items-center justify-center overflow-hidden">
          {user.profilePhotoUrl ? (
            <img src={user.profilePhotoUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={32} className="opacity-20" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-serif italic leading-tight">{fullName}</h3>
          <p className="text-[10px] font-mono uppercase opacity-50">{business?.name || 'Individual Vendor'}</p>
          <div className="flex items-center gap-1 text-[#141414]">
            <MapPin size={10} />
            <span className="text-[9px] font-mono uppercase">{business?.lgaId || 'Not Registered'}</span>
          </div>
        </div>
      </div>

      {/* QR Section */}
      <div className="p-8 bg-[#f9f9f9] flex flex-col items-center gap-4">
        <div className="p-4 bg-white border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <QRCodeSVG value={qrData} size={150} level="H" />
        </div>
        <p className="text-[8px] font-mono uppercase opacity-40 text-center max-w-[200px]">
          Official scan only. This QR code contains encrypted compliance metadata.
        </p>
      </div>

      {/* Status Footer */}
      <div className={`p-4 flex items-center justify-center gap-2 border-t border-[#141414] ${
        complianceStatus === 'COMPLIANT' ? 'bg-green-50 text-green-700' : 
        complianceStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
      }`}>
        <CheckCircle2 size={16} />
        <span className="font-mono text-[10px] uppercase font-bold tracking-widest">
          Status: {complianceStatus}
        </span>
      </div>
    </div>
  );
};
