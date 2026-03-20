import React from 'react';
import { Shield, Award, Calendar, CheckCircle2, Download } from 'lucide-react';

interface CertificateProps {
  type: 'CAC' | 'HEALTH';
  businessName: string;
  vendorName: string;
  number: string;
  issueDate: string;
  expiryDate?: string;
  onDownload?: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({ 
  type, 
  businessName, 
  vendorName, 
  number, 
  issueDate, 
  expiryDate,
  onDownload 
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-[#fdfdfb] border-8 border-[#141414] p-12 relative overflow-hidden">
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#141414] translate-x-16 -translate-y-16 rotate-45" />
      
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <Shield size={400} />
      </div>

      <div className="relative z-10 space-y-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center text-white">
            <Award size={40} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-serif italic uppercase tracking-tighter">Certificate of Compliance</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">Rivers State Formalization Program</p>
          </div>
        </div>

        <div className="space-y-8">
          <p className="font-serif text-lg italic">This is to certify that</p>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-serif italic text-[#141414] underline underline-offset-8 decoration-1">{businessName}</h2>
            <p className="text-[10px] font-mono uppercase opacity-50">Represented by {vendorName}</p>
          </div>

          <p className="font-serif text-lg italic max-w-md mx-auto leading-relaxed">
            Has fulfilled all requirements for {type === 'CAC' ? 'Corporate Affairs Commission Registration' : 'State Health and Safety Standards'} and is hereby granted this digital permit.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-[#141414]/10">
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase opacity-40">Registration Number</p>
            <p className="text-xl font-mono font-bold tracking-tighter">{number}</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase opacity-40">Issue Date</p>
            <p className="text-xl font-mono font-bold tracking-tighter">{new Date(issueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {expiryDate && (
          <div className="flex items-center justify-center gap-2 text-red-600">
            <Calendar size={14} />
            <span className="text-[10px] font-mono uppercase font-bold">Expires: {new Date(expiryDate).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-8 pt-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-1 bg-[#141414]" />
            <p className="text-[8px] font-mono uppercase opacity-50">Registrar General</p>
          </div>
          <div className="w-16 h-16 border-2 border-green-600 rounded-full flex items-center justify-center text-green-600 rotate-[-15deg]">
            <CheckCircle2 size={32} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-1 bg-[#141414]" />
            <p className="text-[8px] font-mono uppercase opacity-50">LGA Chairman</p>
          </div>
        </div>
      </div>

      {onDownload && (
        <button 
          onClick={onDownload}
          className="absolute bottom-4 right-4 p-3 bg-[#141414] text-white rounded-full hover:scale-110 transition-transform shadow-lg"
        >
          <Download size={20} />
        </button>
      )}
    </div>
  );
};
