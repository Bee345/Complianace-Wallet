import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  FileText,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, Business, ComplianceStatus } from '../types';

interface ComplianceReportProps {
  user: User;
  business?: Business;
  taxRecords: any[];
  onClose: () => void;
}

export const ComplianceReport: React.FC<ComplianceReportProps> = ({ user, business, taxRecords, onClose }) => {
  const [reportDate] = useState(new Date());
  
  // Calculate compliance metrics
  const hasCac = business?.registration_status === 'APPROVED';
  const taxCount = taxRecords.length;
  const lastTaxDate = taxRecords.length > 0 ? new Date(taxRecords[0].date) : null;
  const isTaxCurrent = lastTaxDate ? (new Date().getTime() - lastTaxDate.getTime()) < (48 * 60 * 60 * 1000) : false;
  
  const complianceScore = (hasCac ? 40 : 0) + (isTaxCurrent ? 40 : 0) + (taxCount > 5 ? 20 : 10);
  const status: ComplianceStatus = complianceScore > 80 ? 'COMPLIANT' : complianceScore > 40 ? 'PENDING' : 'EXPIRED';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Rivers State Compliance Report',
        text: `My compliance score is ${complianceScore}%! Status: ${status}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing not supported on this browser. Copy the URL to share.');
    }
  };

  const handleDownload = () => {
    const reportData = {
      user: user.name,
      business: business?.name,
      score: complianceScore,
      status: status,
      date: reportDate.toISOString(),
      id: `REP-${reportDate.getTime().toString().slice(-8)}`
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${reportData.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif italic">Compliance Report</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-white transition-all"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-white transition-all"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={120} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] font-mono uppercase opacity-50 tracking-widest">Official Status</div>
              <div className={`text-3xl font-serif italic ${
                status === 'COMPLIANT' ? 'text-emerald-600' : 
                status === 'PENDING' ? 'text-amber-600' : 'text-red-600'
              }`}>
                {status}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase opacity-50 tracking-widest">Score</div>
              <div className="text-3xl font-mono">{complianceScore}%</div>
            </div>
          </div>

          <div className="h-2 bg-[#E4E3E0] border border-[#141414]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${complianceScore}%` }}
              className={`h-full ${
                status === 'COMPLIANT' ? 'bg-emerald-500' : 
                status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#141414] border-dashed">
            <div>
              <div className="text-[8px] font-mono uppercase opacity-50">Report ID</div>
              <div className="text-[10px] font-mono">REP-{reportDate.getTime().toString().slice(-8)}</div>
            </div>
            <div className="text-right">
              <div className="text-[8px] font-mono uppercase opacity-50">Generated</div>
              <div className="text-[10px] font-mono">{reportDate.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Checklist */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest opacity-50">Compliance Checklist</h3>
        
        <div className="bg-white border border-[#141414] divide-y divide-[#141414]">
          {/* CAC Registration */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center ${hasCac ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <Award size={18} />
              </div>
              <div>
                <div className="text-sm font-medium">CAC Registration</div>
                <div className="text-[10px] opacity-50 font-mono uppercase">{business?.cac_registration_number || 'Not Registered'}</div>
              </div>
            </div>
            {hasCac ? <CheckCircle2 className="text-emerald-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
          </div>

          {/* Tax Compliance */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center ${isTaxCurrent ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="text-sm font-medium">Daily Tax (Last 48h)</div>
                <div className="text-[10px] opacity-50 font-mono uppercase">
                  {lastTaxDate ? `Last paid: ${lastTaxDate.toLocaleDateString()}` : 'No records'}
                </div>
              </div>
            </div>
            {isTaxCurrent ? <CheckCircle2 className="text-emerald-500" size={20} /> : <Clock className="text-amber-500" size={20} />}
          </div>

          {/* Health Permit */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-sm font-medium">Health & Safety Permit</div>
                <div className="text-[10px] opacity-50 font-mono uppercase">Valid until Dec 2026</div>
              </div>
            </div>
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-[#141414] text-white p-6 space-y-4">
        <h3 className="font-serif italic text-lg">Recommended Actions</h3>
        <div className="space-y-3">
          {!hasCac && (
            <button className="w-full flex items-center justify-between p-3 border border-white/20 hover:bg-white/10 transition-all">
              <span className="text-xs font-mono uppercase">Complete CAC Registration</span>
              <ChevronRight size={16} />
            </button>
          )}
          {!isTaxCurrent && (
            <button className="w-full flex items-center justify-between p-3 border border-white/20 hover:bg-white/10 transition-all">
              <span className="text-xs font-mono uppercase">Log Today's Sales</span>
              <ChevronRight size={16} />
            </button>
          )}
          <button className="w-full flex items-center justify-between p-3 border border-white/20 hover:bg-white/10 transition-all">
            <span className="text-xs font-mono uppercase">Download Official Certificate</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="w-full py-4 border border-[#141414] font-mono uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all"
      >
        Back to Dashboard
      </button>
    </div>
  );
};
