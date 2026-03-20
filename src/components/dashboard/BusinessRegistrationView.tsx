import React, { useState } from 'react';
import { ShieldCheck, Award, FileText, Camera, Loader2, CheckCircle2, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../../types';
import { PidginVoice } from '../PidginVoice';

interface BusinessRegistrationViewProps {
  user: User;
  onComplete: () => void;
}

export const BusinessRegistrationView: React.FC<BusinessRegistrationViewProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'RETAIL',
    lga: 'PH-ALAL',
    photo: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'VENDOR',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          id: `biz-${Date.now()}`,
          vendorId: user.id,
          name: formData.name,
          lgaId: formData.lga,
          address: formData.address,
          businessType: formData.type,
          photoUrl: formData.photo || 'https://picsum.photos/seed/biz/400/400',
          registrationStatus: 'SUBMITTED'
        })
      });

      if (response.ok) {
        setStep(3);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-serif italic">Business Registration</h2>
        <p className="text-xs font-mono uppercase opacity-50 tracking-widest">Formalize your business with CAC</p>
      </div>

      <div className="bg-white border border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        {step === 1 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="font-serif italic text-2xl">Step 1: Basic Info</h3>
              <PidginVoice text="Enter your business name and address. Make sure the name never exist before." context="Business Registration Step 1" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase opacity-50">Business Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 border border-[#141414] font-mono focus:ring-0"
                  placeholder="e.g. Amara's Kitchen"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase opacity-50">Business Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-4 border border-[#141414] font-mono focus:ring-0"
                  rows={3}
                  placeholder="e.g. No 12, Aggrey Road, Port Harcourt"
                />
              </div>
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.address}
              className="w-full bg-[#141414] text-white py-5 font-mono uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="font-serif italic text-2xl">Step 2: Verification</h3>
              <PidginVoice text="Upload your business photo and select your business type. This go help us verify your shop." context="Business Registration Step 2" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase opacity-50">Business Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-4 border border-[#141414] font-mono focus:ring-0"
                >
                  <option value="RETAIL">Retail / Shop</option>
                  <option value="FOOD">Food / Restaurant</option>
                  <option value="SERVICES">Services / Salon</option>
                  <option value="MANUFACTURING">Manufacturing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase opacity-50">Shop Front Photo</label>
                <div className="border-2 border-dashed border-[#141414] p-12 text-center space-y-4">
                  <Camera size={48} className="mx-auto opacity-20" />
                  <p className="text-[10px] font-mono uppercase opacity-50">Click to upload or drag photo</p>
                  <input type="file" className="hidden" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-5 border border-[#141414] font-mono uppercase tracking-widest hover:bg-[#f5f5f5] transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-[#141414] text-white py-5 font-mono uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Submit Application'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-8 py-12">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif italic text-3xl">Application Submitted!</h3>
              <p className="text-xs font-mono opacity-50 uppercase tracking-widest">Your CAC number go ready in 48 hours</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-6 text-left italic text-xs leading-relaxed text-emerald-800">
              "Amara, you don do well! Your business don dey formal now. You go fit get government support and bank loans soon."
            </div>
            <button 
              onClick={onComplete}
              className="w-full bg-[#141414] text-white py-5 font-mono uppercase tracking-widest hover:bg-opacity-90 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
