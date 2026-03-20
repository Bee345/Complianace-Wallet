import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DocumentsViewProps {
  userId: string;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ userId }) => {
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/vendor/${userId}`, {
          headers: { 'x-user-role': 'VENDOR', 'x-user-id': userId }
        });
        const data = await res.json();
        setBusiness(data.business);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBusiness();
  }, [userId]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin opacity-20" size={48} /></div>;

  const documents = [
    { 
      id: 'cac', 
      name: 'CAC Registration Certificate', 
      status: business?.registration_status === 'APPROVED' ? 'AVAILABLE' : business?.registration_status === 'SUBMITTED' ? 'PENDING' : 'NOT_STARTED',
      number: business?.cac_registration_number || 'N/A'
    },
    { 
      id: 'tax', 
      name: 'Tax Compliance Certificate', 
      status: 'AVAILABLE',
      number: `TCC-${userId.slice(-6).toUpperCase()}`
    },
    { 
      id: 'health', 
      name: 'Health & Safety Permit', 
      status: 'AVAILABLE',
      number: `HSP-2026-001`
    }
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-serif italic">CAC & Compliance Documents</h2>
        <p className="text-sm font-mono uppercase opacity-50">Official documents for your business formalization</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {documents.map((doc, idx) => (
          <motion.div 
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 flex items-center justify-center border border-[#141414] ${
                doc.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : 
                doc.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
              }`}>
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-lg font-serif italic">{doc.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono uppercase opacity-50">ID: {doc.number}</span>
                  <span className={`text-[8px] font-mono uppercase px-2 py-0.5 border border-[#141414] ${
                    doc.status === 'AVAILABLE' ? 'bg-emerald-500 text-white' : 
                    doc.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {doc.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {doc.status === 'AVAILABLE' ? (
                <>
                  <button className="flex-1 md:flex-none px-4 py-2 border border-[#141414] font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#f5f5f5] transition-all">
                    <Eye size={14} /> View
                  </button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-[#141414] text-white font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
                    <Download size={14} /> Download
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase opacity-50 italic">
                  {doc.status === 'PENDING' ? (
                    <><Clock size={14} /> Verification in progress...</>
                  ) : (
                    <><AlertCircle size={14} /> Registration required</>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#141414] text-white p-8 border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,0.2)]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-serif italic">Compliance Status: Verified</h4>
            <p className="text-xs font-mono opacity-60 leading-relaxed">
              "Your business don dey verified by Rivers State Government. You fit use these documents apply for loan or government contract."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Clock: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
