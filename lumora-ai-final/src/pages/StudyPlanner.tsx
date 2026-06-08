import { useState, useEffect } from 'react';
import { BookOpen, Calendar, CheckSquare, Loader2, Play } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';

interface Task {
  desc: string;
  done: boolean;
}

interface WeekPlan {
  week: number;
  topic: string;
  tasks: Task[];
}

export default function StudyPlanner() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [timeline, setTimeline] = useState('4 Weeks');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<WeekPlan[] | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  useEffect(() => {
    // Try to load user's last plan
    const loadLastPlan = async () => {
      if (!user) return;
      try {
        const d = await getDoc(doc(db, 'users', user.uid, 'settings', 'studyPlan'));
        if (d.exists()) {
          const data = d.data();
          setTopic(data.topic);
          setTimeline(data.timeline);
          setRoadmap(data.roadmap);
          setActivePlanId('studyPlan');
        }
      } catch(e) {}
    };
    loadLastPlan();
  }, [user]);

  const generatePlan = async () => {
    if (!topic.trim() || !user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, timeline })
      });
      const data = await res.json();
      if (data.success && data.text) {
        const cleaned = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        const planWithState = parsed.roadmap.map((w: any) => ({
          ...w,
          tasks: w.tasks.map((t: string) => ({ desc: t, done: false }))
        }));
        
        setRoadmap(planWithState);
        setActivePlanId('studyPlan');
        
        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid, 'settings', 'studyPlan'), {
          topic,
          timeline,
          roadmap: planWithState,
          updatedAt: serverTimestamp()
        });

        // Add history entry
        await setDoc(doc(collection(db, 'users', user.uid, 'history')), {
          type: 'study',
          title: `Generated Study Plan: ${topic}`,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (weekIdx: number, taskIdx: number) => {
    if (!roadmap || !user || !activePlanId) return;
    const newRoadmap = [...roadmap];
    newRoadmap[weekIdx].tasks[taskIdx].done = !newRoadmap[weekIdx].tasks[taskIdx].done;
    setRoadmap(newRoadmap);

    try {
      await updateDoc(doc(db, 'users', user.uid, 'settings', 'studyPlan'), {
        roadmap: newRoadmap,
        updatedAt: serverTimestamp()
      });
    } catch(e) {
      console.error("Error updating progress", e);
    }
  };

  // Calculate overall progress
  let totalTasks = 0;
  let compTasks = 0;
  if (roadmap) {
    roadmap.forEach(w => {
      w.tasks.forEach(t => {
        totalTasks++;
        if (t.done) compTasks++;
      });
    });
  }
  const progressPercent = totalTasks > 0 ? Math.round((compTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Study Planner</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generate a structured learning roadmap</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <BookOpen className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="What do you want to learn? (e.g. UI/UX Design)" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div className="w-full sm:w-48 relative">
            <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={timeline}
              onChange={e => setTimeline(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:outline-none appearance-none"
            >
              <option>1 Week</option>
              <option>2 Weeks</option>
              <option>4 Weeks</option>
              <option>8 Weeks</option>
              <option>12 Weeks</option>
            </select>
          </div>
          <button 
            onClick={generatePlan}
            disabled={loading || !topic.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Generate <Play className="w-4 h-4 ml-2 fill-current" /></>}
          </button>
        </div>
      </div>

      {roadmap && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your {timeline} Roadmap</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{topic}</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 min-w-[200px] border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">Overall Progress</span>
                <span className="font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-right">{compTasks} of {totalTasks} tasks completed</p>
            </div>
          </div>

          <div className="space-y-6">
            {roadmap.map((week, wIdx) => (
              <div key={wIdx} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Week {week.week}: {week.topic}</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {week.tasks.map((task, tIdx) => (
                     <label key={tIdx} className="flex items-start space-x-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors group">
                       <div className="pt-0.5 shrink-0">
                         {task.done ? (
                           <CheckSquare className="w-5 h-5 text-secondary" />
                         ) : (
                           <div className="w-5 h-5 rounded-[4px] border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary transition-colors"></div>
                         )}
                       </div>
                       <input 
                         type="checkbox" 
                         className="hidden" 
                         checked={task.done}
                         onChange={() => toggleTask(wIdx, tIdx)}
                       />
                       <span className={`text-sm select-none ${task.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                         {task.desc}
                       </span>
                     </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
