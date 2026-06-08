import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Loader2, Target, Milestone, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface Props {
  profile: any;
  targetCareer: string;
  onBack: () => void;
}

export default function CareerPathDetails({ profile, targetCareer, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'gap'>('roadmap');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === 'roadmap' && !roadmap) fetchRoadmap();
    if (activeTab === 'gap' && !gapData) fetchGapData();
  }, [activeTab]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/career-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, targetCareer })
      });
      const data = await res.json();
      if (data.success) {
        setRoadmap(JSON.parse(data.text.replace(/```json/g, '').replace(/```/g, '').trim()));
      }
    } catch (err) {
      toast("Failed to generate roadmap", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchGapData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, targetCareer })
      });
      const data = await res.json();
      if (data.success) {
        setGapData(JSON.parse(data.text.replace(/```json/g, '').replace(/```/g, '').trim()));
      }
    } catch (err) {
      toast("Failed to analyze skills", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-in slide-in-from-right-8 fade-in">
      <button onClick={onBack} className="flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Recommendations
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{targetCareer}</h2>
          <p className="text-slate-500 text-sm">Personalized Action Plan</p>
        </div>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setActiveTab('roadmap')} 
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'roadmap' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Career Roadmap
        </button>
        <button 
          onClick={() => setActiveTab('gap')} 
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'gap' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Skill Gap Analysis
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Generating AI insights...</p>
        </div>
      ) : activeTab === 'roadmap' && roadmap ? (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
          {roadmap.roadmap.map((step: any, idx: number) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Milestone className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-left">
                <div className="text-xs font-bold text-primary mb-1">STEP {step.step}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{step.description}</p>
                {step.milestones && (
                  <ul className="space-y-1">
                    {step.milestones.map((m: string, i: number) => (
                      <li key={i} className="flex items-start text-xs text-slate-500 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 mr-2 shrink-0"></span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'gap' && gapData ? (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5">
               <h3 className="text-emerald-800 dark:text-emerald-400 font-bold mb-3 flex items-center"><Sparkles className="w-4 h-4 mr-2"/> Existing Strengths</h3>
               <div className="flex flex-wrap gap-2">
                 {gapData.existingSkills.map((s: string, i: number) => <span key={i} className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg font-medium">{s}</span>)}
               </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-5">
               <h3 className="text-rose-800 dark:text-rose-400 font-bold mb-3 flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/> Missing Skills</h3>
               <div className="flex flex-wrap gap-2">
                 {gapData.missingSkills.map((s: string, i: number) => <span key={i} className="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs rounded-lg font-medium">{s}</span>)}
               </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5">
             <h3 className="text-blue-800 dark:text-blue-400 font-bold mb-3">Top Priorities</h3>
             <ul className="space-y-2">
               {gapData.priorities.map((p: string, i: number) => (
                 <li key={i} className="text-sm text-blue-900 dark:text-blue-200 flex items-start">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 shrink-0"></div>
                   {p}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
