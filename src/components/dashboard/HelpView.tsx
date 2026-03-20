import React, { useState, useEffect } from 'react';
import { HelpCircle, Play, MessageCircle, Phone, Loader2, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpViewProps {
  userId: string;
}

export const HelpView: React.FC<HelpViewProps> = ({ userId }) => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('/api/help/faq');
        const data = await res.json();
        setFaqs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const speakPidgin = (text: string, idx: number) => {
    if (isSpeaking === idx) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(null);
    setIsSpeaking(idx);
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin opacity-20" size={48} /></div>;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-serif italic">Help & Pidgin Guidance</h2>
        <p className="text-sm font-mono uppercase opacity-50">"We dey here to help you grow your business"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center gap-4 hover:bg-[#f5f5f5] transition-all cursor-pointer">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center border border-[#141414]">
            <MessageCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-serif italic">Chat with Agent</h3>
            <p className="text-[10px] font-mono opacity-50 uppercase italic">"Talk to our team for WhatsApp"</p>
          </div>
        </div>
        <div className="bg-white border border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center gap-4 hover:bg-[#f5f5f5] transition-all cursor-pointer">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center border border-[#141414]">
            <Phone size={24} />
          </div>
          <div>
            <h3 className="text-lg font-serif italic">Call Support</h3>
            <p className="text-[10px] font-mono opacity-50 uppercase italic">"Call us for free: 0800-COMPLY"</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest opacity-50">Frequently Asked Questions</h3>
        <div className="bg-white border border-[#141414] divide-y divide-[#141414]">
          {faqs.map((faq, idx) => (
            <div key={idx} className="overflow-hidden">
              <button 
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-[#f5f5f5] transition-all"
              >
                <span className="text-lg font-serif italic">{faq.q}</span>
                {expandedIdx === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              <AnimatePresence>
                {expandedIdx === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6 space-y-4"
                  >
                    <div className="p-4 bg-[#f5f5f5] border border-[#141414] text-sm leading-relaxed italic">
                      "{faq.a}"
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase opacity-50">
                        <Volume2 size={14} /> Listen in Pidgin
                      </div>
                      <button 
                        onClick={() => speakPidgin(faq.pidgin, idx)}
                        className={`px-4 py-2 border border-[#141414] font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                          isSpeaking === idx ? 'bg-[#141414] text-white' : 'hover:bg-[#f5f5f5]'
                        }`}
                      >
                        {isSpeaking === idx ? 'Stop Voice' : 'Play Voice'}
                        <Play size={12} fill={isSpeaking === idx ? 'white' : 'currentColor'} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#141414] text-white p-8 border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,0.2)]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full shrink-0">
            <HelpCircle size={20} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-serif italic">Still need help?</h4>
            <p className="text-xs font-mono opacity-60 leading-relaxed">
              "If you no understand wetyn to do, just waka go any LGA office for Rivers State. Our people go help you register sharp-sharp."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
