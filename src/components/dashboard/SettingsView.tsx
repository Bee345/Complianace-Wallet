import React, { useState, useEffect } from 'react';
import { Settings, Bell, Volume2, Moon, Loader2, Save, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  userId: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userId }) => {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/user/settings/${userId}`, {
          headers: { 'x-user-role': 'VENDOR', 'x-user-id': userId }
        });
        const data = await res.json();
        setSettings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [userId]);

  const handleToggle = async (key: string) => {
    const newSettings = { ...settings, [key]: settings[key] ? 0 : 1 };
    setSettings(newSettings);
    
    setIsSaving(true);
    try {
      await fetch(`/api/user/settings/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'VENDOR',
          'x-user-id': userId
        },
        body: JSON.stringify(newSettings)
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin opacity-20" size={48} /></div>;

  const settingItems = [
    { 
      id: 'notifications_enabled', 
      name: 'Push Notifications', 
      desc: 'Get alerts for tax payments and compliance updates',
      icon: <Bell size={20} />
    },
    { 
      id: 'pidgin_voice_enabled', 
      name: 'Pidgin Voice Guidance', 
      desc: 'Enable audio instructions in Nigerian Pidgin',
      icon: <Volume2 size={20} />
    },
    { 
      id: 'dark_mode_enabled', 
      name: 'Dark Mode', 
      desc: 'Switch to dark theme for night usage',
      icon: <Moon size={20} />
    }
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-serif italic">App Settings</h2>
        <p className="text-sm font-mono uppercase opacity-50">Customize your experience on Compliance Wallet</p>
      </div>

      <div className="bg-white border border-[#141414] divide-y divide-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        {settingItems.map((item) => (
          <div key={item.id} className="p-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center border border-[#141414] bg-[#f5f5f5]">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-serif italic">{item.name}</h3>
                <p className="text-[10px] font-mono opacity-50 uppercase">{item.desc}</p>
              </div>
            </div>

            <button 
              onClick={() => handleToggle(item.id)}
              className={`w-14 h-8 border-2 border-[#141414] relative transition-all ${
                settings[item.id] ? 'bg-[#141414]' : 'bg-white'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 border border-[#141414] transition-all ${
                settings[item.id] ? 'right-1 bg-white' : 'left-1 bg-[#141414]'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest opacity-50">Account Security</h3>
        <button className="w-full py-4 border border-[#141414] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#f5f5f5] transition-all">
          Change Password
        </button>
        <button className="w-full py-4 border border-red-600 text-red-600 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 transition-all">
          <LogOut size={16} /> Logout Account
        </button>
      </div>

      {isSaving && (
        <div className="fixed bottom-8 right-8 bg-[#141414] text-white px-4 py-2 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl">
          <Loader2 size={12} className="animate-spin" /> Saving Settings...
        </div>
      )}
    </div>
  );
};
