import React from 'react';
import { ShieldCheck, Wallet, ArrowRight, CheckCircle2, Globe, Zap, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-white">
      {/* Navigation */}
      <nav className="px-6 py-6 flex justify-between items-center border-b border-[#141414]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <span className="font-serif italic text-xl tracking-tight">Compliance Wallet</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-mono uppercase tracking-widest">
          <a href="#features" className="hover:opacity-50 transition-opacity">Features</a>
          <a href="#how-it-works" className="hover:opacity-50 transition-opacity">How it works</a>
          <a href="#lga" className="hover:opacity-50 transition-opacity">For LGA</a>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onGetStarted}
            className="px-6 py-2 text-[10px] font-mono uppercase tracking-widest hover:opacity-50 transition-all"
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            className="px-6 py-2 border border-[#141414] text-[10px] font-mono uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="inline-block px-3 py-1 bg-white border border-[#141414] text-[10px] font-mono uppercase tracking-widest">
            Nigeria's First Digital Wallet for Street Vendors
          </div>
          <h1 className="text-6xl md:text-8xl font-serif italic leading-[0.85] tracking-tight">
            Formalize your <br />
            <span className="text-[#141414]/40">business in</span> <br />
            60 seconds.
          </h1>
          <p className="text-lg md:text-xl font-serif italic opacity-70 max-w-md">
            The all-in-one compliance tool for Nigerian micro-sellers. Log turnover, pay taxes, and manage permits—all from your phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onGetStarted}
              className="px-10 py-5 bg-[#141414] text-white font-mono uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
            >
              Get Started Now <ArrowRight size={20} />
            </button>
            <button className="px-10 py-5 border border-[#141414] font-mono uppercase tracking-widest hover:bg-white transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-[4/5] bg-white border border-[#141414] shadow-[24px_24px_0px_0px_rgba(20,20,20,1)] overflow-hidden relative group">
            <img 
              src="https://picsum.photos/seed/market/800/1000" 
              alt="Nigerian Market Vendor" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/80 to-transparent flex flex-col justify-end p-8 text-white">
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-70 mb-2">Featured Vendor</div>
              <div className="text-3xl font-serif italic">Amara Obi</div>
              <div className="text-xs font-mono opacity-70">Fruit Seller • Mile 3 Market</div>
            </div>
          </div>
          
          {/* Floating Badge */}
          <div className="absolute -top-8 -right-8 bg-white border border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hidden md:block animate-bounce">
            <div className="text-4xl font-mono font-bold">₦0</div>
            <div className="text-[10px] font-mono uppercase opacity-50">Registration Fee</div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-white border-y border-[#141414] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#E4E3E0] flex items-center justify-center border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <Smartphone size={24} />
              </div>
              <h3 className="text-2xl font-serif italic">Offline First</h3>
              <p className="text-sm font-serif italic opacity-60 leading-relaxed">
                No data? No problem. Log your sales and pay levies even when you're offline. Everything syncs when you're back.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#E4E3E0] flex items-center justify-center border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <Globe size={24} />
              </div>
              <h3 className="text-2xl font-serif italic">Pidgin Support</h3>
              <p className="text-sm font-serif italic opacity-60 leading-relaxed">
                Voice guidance in Nigerian Pidgin English makes it easy for everyone to use, regardless of literacy level.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#E4E3E0] flex items-center justify-center border border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <Zap size={24} />
              </div>
              <h3 className="text-2xl font-serif italic">Instant Verification</h3>
              <p className="text-sm font-serif italic opacity-60 leading-relaxed">
                LGA officials can verify your compliance status in seconds by scanning your unique digital ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-serif italic mb-4">How it Works</h2>
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">Three steps to full compliance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Register', desc: 'Create your account and register your business with your LGA in minutes.' },
            { step: '02', title: 'Log Sales', desc: 'Use the simple interface to log your daily turnover, even without internet.' },
            { step: '03', title: 'Stay Compliant', desc: 'Pay your daily levies and get instant digital certificates and ID cards.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 border border-[#141414] bg-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
            >
              <div className="text-4xl font-serif italic text-[#141414]/20 mb-4">{item.step}</div>
              <h4 className="text-xl font-serif italic mb-2">{item.title}</h4>
              <p className="text-sm font-serif italic opacity-60">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LGA Section */}
      <section id="lga" className="bg-[#141414] text-white py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-serif italic leading-tight">
              Empowering Local <br />
              <span className="text-white/40">Government Authorities</span>
            </h2>
            <p className="text-lg font-serif italic opacity-70">
              Our platform provides LGAs with real-time data on vendor compliance, revenue collection, and market demographics.
            </p>
            <ul className="space-y-4">
              {[
                'Real-time revenue dashboards',
                'Digital enforcement tools',
                'Automated tax band management',
                'Direct communication with vendors'
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
                  <CheckCircle2 size={16} className="text-green-400" /> {text}
                </li>
              ))}
            </ul>
            <button className="px-8 py-4 border border-white text-[10px] font-mono uppercase tracking-widest hover:bg-white hover:text-[#141414] transition-all">
              Partner with us
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-white/5 border border-white/10 p-8 flex flex-col justify-center items-center text-center">
              <div className="text-4xl font-mono font-bold mb-2">98%</div>
              <div className="text-[8px] font-mono uppercase opacity-50">Collection Efficiency</div>
            </div>
            <div className="aspect-square bg-white/5 border border-white/10 p-8 flex flex-col justify-center items-center text-center">
              <div className="text-4xl font-mono font-bold mb-2">15k+</div>
              <div className="text-[8px] font-mono uppercase opacity-50">Verified Vendors</div>
            </div>
            <div className="aspect-square bg-white/5 border border-white/10 p-8 flex flex-col justify-center items-center text-center">
              <div className="text-4xl font-mono font-bold mb-2">23</div>
              <div className="text-[8px] font-mono uppercase opacity-50">Active LGAs</div>
            </div>
            <div className="aspect-square bg-white/5 border border-white/10 p-8 flex flex-col justify-center items-center text-center">
              <div className="text-4xl font-mono font-bold mb-2">24/7</div>
              <div className="text-[8px] font-mono uppercase opacity-50">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 bg-[#141414] text-white overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-12 px-6">
              <span className="text-xl font-mono uppercase tracking-[0.3em] opacity-50">CAC INTEGRATED</span>
              <CheckCircle2 size={24} className="opacity-30" />
              <span className="text-xl font-mono uppercase tracking-[0.3em] opacity-50">LGA APPROVED</span>
              <CheckCircle2 size={24} className="opacity-30" />
              <span className="text-xl font-mono uppercase tracking-[0.3em] opacity-50">SECURE DATA</span>
              <CheckCircle2 size={24} className="opacity-30" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-[#141414] flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-[10px] font-mono uppercase opacity-50">
          © 2026 Street Vendor Compliance Wallet • Built for Nigeria
        </div>
        <div className="flex gap-8 text-[10px] font-mono uppercase tracking-widest">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact Support</a>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
