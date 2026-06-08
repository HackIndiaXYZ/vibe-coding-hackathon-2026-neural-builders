import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Loader2, CheckCircle, Target, Sparkles } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function WeeklyMissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          if (data.weeklyMissions) {
            setMissions(data.weeklyMissions);
          }
        }
      }
    }
    load();
  }, [user]);

  const generateMissions = async () => {
    if (!profile || !user) return;
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/weekly-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await response.json();
      if (data.success) {
        let result = JSON.parse(data.text.replace(/```json/g, '').replace(/```/g, '').trim());
        const newMissions = result.missions.map((m: any) => ({ ...m, completed: false }));
        setMissions(newMissions);
        await updateDoc(doc(db, 'users', user.uid), { weeklyMissions: newMissions });
        toast("New missions generated!", "success");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to generate missions.", "error");
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (idx: number, reward: number) => {
    if (!user || missions[idx].completed) return;
    
    const newMissions = [...missions];
    newMissions[idx].completed = true;
    setMissions(newMissions);
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        weeklyMissions: newMissions,
        opportunityScore: Math.min(100, (profile?.opportunityScore || 50) + reward)
      });
      toast(`Mission completed! +${reward} Score`, "success");
    } catch (error) {
      console.error(error);
      toast("Error completing mission", "error");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          Weekly Missions
        </h2>
        {missions.length > 0 && (
          <button onClick={generateMissions} disabled={loading} className="text-xs text-primary font-medium hover:underline">
            {loading ? 'Generating...' : 'Refresh'}
          </button>
        )}
      </div>

      {loading && missions.length === 0 ? (
         <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : missions.length > 0 ? (
        <div className="space-y-3">
          {missions.map((mission, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 transition ${mission.completed ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
              <button 
                onClick={() => completeMission(idx, mission.scoreReward || 5)}
                disabled={mission.completed}
                className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 transition ${mission.completed ? 'bg-secondary border-secondary text-white' : 'border-slate-300 dark:border-slate-600 hover:border-primary'}`}
              >
                {mission.completed && <CheckCircle className="w-4 h-4" />}
              </button>
              <div>
                <h4 className={`text-sm font-bold ${mission.completed ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>{mission.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{mission.description}</p>
                {!mission.completed && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded">+{mission.scoreReward || 5} Score</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No missions active for this week.</p>
          <button onClick={generateMissions} disabled={loading} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl">
            {loading ? 'Generating...' : 'Generate Missions'}
          </button>
        </div>
      )}
    </div>
  );
}
