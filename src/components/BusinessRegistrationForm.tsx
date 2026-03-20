import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  Store, 
  MapPin, 
  CheckCircle2,
  AlertCircle,
  Upload,
  ShoppingBag,
  Utensils,
  Wrench,
  Hammer,
  Truck
} from 'lucide-react';

interface BusinessRegistrationFormProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export const BusinessRegistrationForm: React.FC<BusinessRegistrationFormProps> = ({ onClose, onSubmit, isLoading }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Retail',
    lga: 'Port Harcourt',
    address: '',
    photo: null as string | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Business name is required';
      if (!formData.type) newErrors.type = 'Business type is required';
    } else if (step === 2) {
      if (!formData.lga) newErrors.lga = 'LGA is required';
      if (!formData.address) newErrors.address = 'Address is required';
    } else if (step === 3) {
      if (!formData.photo) newErrors.photo = 'Shop front photo is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (validateStep()) {
      await onSubmit(formData);
    }
  };

  const businessTypes = [
    { id: 'Retail', label: 'Retail', icon: ShoppingBag, description: 'Shops, kiosks, and stalls' },
    { id: 'Food', label: 'Food & Beverage', icon: Utensils, description: 'Bukkas, cafes, and bars' },
    { id: 'Services', label: 'Services', icon: Wrench, description: 'Barbers, tailors, and repairs' },
    { id: 'Artisan', label: 'Artisan', icon: Hammer, description: 'Crafts, arts, and making' },
    { id: 'Wholesale', label: 'Wholesale', icon: Truck, description: 'Bulk sales and distribution' }
  ];
  const lgas = ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Oyigbo', 'Ikwerre', 'Etche'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-[#141414] transition-all">
            <X size={20} />
          </button>
          <h2 className="text-2xl font-serif italic">Business Registration</h2>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1 w-8 transition-all ${step >= i ? 'bg-[#141414]' : 'bg-[#E4E3E0]'}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 text-[#141414] opacity-30 mb-2">
                <Store size={16} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Step 01: Identity</span>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-50 block">Business Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Amara Food Hub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full text-2xl font-mono border-b ${errors.name ? 'border-red-500' : 'border-[#141414]'} focus:ring-0 p-2 placeholder:opacity-10`}
                />
                {errors.name && <p className="text-red-500 text-[10px] font-mono uppercase">{errors.name}</p>}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-50 block">Business Type</label>
                <div className="grid grid-cols-1 gap-3">
                  {businessTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, type: type.label })}
                      className={`p-4 border border-[#141414] flex items-center gap-4 transition-all text-left ${
                        formData.type === type.label 
                          ? 'bg-[#141414] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' 
                          : 'bg-white hover:bg-[#f5f5f5]'
                      }`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center border ${
                        formData.type === type.label ? 'border-white/20' : 'border-[#141414]/10'
                      }`}>
                        <type.icon size={20} />
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest font-bold">{type.label}</div>
                        <div className={`text-[9px] font-mono uppercase opacity-50 ${
                          formData.type === type.label ? 'text-white/60' : ''
                        }`}>
                          {type.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 text-[#141414] opacity-30 mb-2">
                <MapPin size={16} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Step 02: Location</span>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-50 block">LGA Location</label>
                <select 
                  value={formData.lga}
                  onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                  className="w-full text-lg font-mono border-b border-[#141414] focus:ring-0 p-2 bg-transparent"
                >
                  {lgas.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-50 block">Full Business Address</label>
                <textarea 
                  placeholder="e.g. Shop 42, Mile 3 Market, Ikwerre Road"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full text-lg font-mono border-b ${errors.address ? 'border-red-500' : 'border-[#141414]'} focus:ring-0 p-2 placeholder:opacity-10 min-h-[100px] resize-none`}
                />
                {errors.address && <p className="text-red-500 text-[10px] font-mono uppercase">{errors.address}</p>}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 text-[#141414] opacity-30 mb-2">
                <Camera size={16} />
                <span className="text-[10px] font-mono uppercase tracking-widest">Step 03: Verification</span>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-50 block">Shop Front Photo</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label 
                    htmlFor="photo-upload"
                    className={`w-full aspect-video border-2 border-dashed border-[#141414] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#f9f9f9] transition-all overflow-hidden ${
                      formData.photo ? 'border-solid' : ''
                    }`}
                  >
                    {formData.photo ? (
                      <img src={formData.photo} alt="Shop Front" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={32} className="opacity-20" />
                        <span className="text-[10px] font-mono uppercase opacity-50">Click to upload or take photo</span>
                      </>
                    )}
                  </label>
                </div>
                {errors.photo && <p className="text-red-500 text-[10px] font-mono uppercase">{errors.photo}</p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-blue-600 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-blue-800 italic">
                  "Make sure your shop sign dey show clearly for the photo. CAC go check am."
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex gap-4">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="flex-1 py-4 border border-[#141414] font-mono text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-[#f5f5f5] transition-all"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          
          {step < 3 ? (
            <button 
              onClick={nextStep}
              className="flex-[2] bg-[#141414] text-white py-4 font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            >
              Next Step <ChevronRight size={14} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-[2] bg-[#141414] text-white py-4 font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Complete Registration'} <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
