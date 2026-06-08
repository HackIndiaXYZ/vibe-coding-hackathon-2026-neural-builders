import { useState, useEffect } from 'react';
import EmptyState from '../components/EmptyState';
import { Clock, Briefcase, FileText, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';

interface HistoryItem {
  id: string;
  type: 'cv' | 'study' | 'career' | 'setup' | 'portfolio' | 'scholarship';
  title: string;
  createdAt: any;
  details?: any;
}

export default function History() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'history'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const items: HistoryItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as HistoryItem);
      });
      setActivities(items);
      setLoading(false);
    }, (error) => {
      console.error("Error in History snapshot:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const getIconData = (type: string) => {
    switch(type) {
      case 'cv': return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
      case 'study': return { icon: Clock, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' };
      case 'career': return { icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' };
      case 'portfolio': return { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' };
      default: return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return 'Just now';
    return ts.toDate().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity History</h1>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
          </div>
        ) : activities.length === 0 ? (
           <EmptyState 
             icon={Clock}
             title="No history yet"
             description="Start using LUMORA AI to see your activities here."
           />
        ) : (
          <div className="relative border-l border-slate-200 dark:border-slate-700 ml-4 space-y-8 pb-4">
            {activities.map((item) => {
              const { icon: Icon, color, bg } = getIconData(item.type);
              return (
                <div key={item.id} className="relative pl-8 animate-in fade-in">
                  <div className={`absolute -left-[18px] top-1 h-9 w-9 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 group hover:shadow-sm transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatTime(item.createdAt)}</p>
                      </div>
                      {item.details && (
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-900 dark:text-white truncate">{selectedItem.title}</h2>
              <button onClick={() => setSelectedItem(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-mono text-sm">
              <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(selectedItem.details, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button 
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium text-sm transition hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
