import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, limit } from 'firebase/firestore';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'notifications'), 
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const notes: AppNotification[] = [];
      snapshot.forEach(doc => {
        notes.push({ id: doc.id, ...doc.data() } as AppNotification);
      });
      setNotifications(notes);
    }, (error) => {
      console.error("Error in NotificationBell snapshot:", error);
    });

    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.read);
    for (const note of unread) {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', note.id), {
        read: true
      });
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return 'just now';
    const d = ts.toDate();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 relative transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        )}
      </button>
      
      {showNotifications && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden transform opacity-100 scale-100 transition-all z-50">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline font-medium">Mark all as read</button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map(note => (
                  <div key={note.id} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${note.read ? 'opacity-60' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}>
                    <div className="flex gap-3">
                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${note.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{note.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{note.message}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{formatTime(note.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
