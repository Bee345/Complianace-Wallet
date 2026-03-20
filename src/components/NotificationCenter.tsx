import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, X, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  is_read: number;
  created_at: string;
}

export const NotificationCenter: React.FC<{ userId: string }> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/${userId}`, {
        headers: { 'x-user-role': 'VENDOR', 'x-user-id': userId }
      });
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'VENDOR',
          'x-user-id': userId
        },
        body: JSON.stringify({ notificationId: id })
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[#f5f5f5] rounded-full relative transition-all border border-transparent hover:border-[#141414]"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white border-2 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-[#141414] bg-[#f9f9f9] flex items-center justify-between">
                <h3 className="font-mono text-[10px] uppercase font-bold tracking-widest">Notifications</h3>
                <button onClick={() => setIsOpen(false)}><X size={14} /></button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Info size={24} className="mx-auto opacity-20" />
                    <p className="text-[10px] font-mono uppercase opacity-40 italic">"No updates yet. Everything set."</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 border-b border-[#141414]/10 hover:bg-[#f9f9f9] cursor-pointer transition-all relative ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                    >
                      {!n.is_read && <Circle size={6} className="absolute top-4 right-4 text-blue-500 fill-blue-500" />}
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {n.type === 'SUCCESS' ? <CheckCircle2 size={14} className="text-green-600" /> :
                           n.type === 'ERROR' ? <AlertCircle size={14} className="text-red-600" /> :
                           <Info size={14} className="text-blue-600" />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono uppercase font-bold leading-tight">{n.title}</p>
                          <p className="text-[10px] font-mono opacity-60 leading-relaxed">{n.message}</p>
                          <p className="text-[8px] font-mono opacity-30 uppercase">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
