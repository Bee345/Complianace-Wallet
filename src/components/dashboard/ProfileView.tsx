import React, { useState, useEffect } from 'react';
import { User, Camera, Save, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileViewProps {
  userId: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userId }) => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    phoneNumber: '',
    profilePhotoUrl: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/profile/${userId}`, {
          headers: { 'x-user-role': 'VENDOR', 'x-user-id': userId }
        });
        const data = await res.json();
        setProfile(data);
        setFormData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phone_number || '',
          profilePhotoUrl: data.profile_photo_url || ''
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/user/profile/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'VENDOR',
          'x-user-id': userId
        },
        body: JSON.stringify(formData)
      });
      // Refresh local state
      setProfile({ ...profile, ...formData, first_name: formData.firstName, last_name: formData.lastName, name: formData.name, phone_number: formData.phoneNumber, profile_photo_url: formData.profilePhotoUrl });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin opacity-20" size={48} /></div>;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="w-32 h-32 bg-[#141414] border-2 border-[#141414] overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)]">
            {formData.profilePhotoUrl ? (
              <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white opacity-20">
                <User size={64} />
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white border border-[#141414] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:bg-[#f5f5f5] transition-all">
            <Camera size={16} />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-serif italic">{profile?.name || `${profile?.first_name} ${profile?.last_name}`}</h2>
          <p className="text-xs font-mono uppercase opacity-50">@{profile?.username} • Vendor ID: {profile?.id}</p>
        </div>
      </div>

      <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Display Name / Business Name</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-[#141414] font-mono text-sm focus:ring-0 outline-none"
            placeholder="e.g. Amara the Food Seller"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">First Name</label>
            <input 
              type="text" 
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full p-3 border border-[#141414] font-mono text-sm focus:ring-0 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Last Name</label>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full p-3 border border-[#141414] font-mono text-sm focus:ring-0 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Email Address</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 border border-[#141414] font-mono text-sm focus:ring-0 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Phone Number</label>
          <input 
            type="tel" 
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full p-3 border border-[#141414] font-mono text-sm focus:ring-0 outline-none"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-[#141414] text-white font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Saving Changes...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );
};
