import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, TrendingUp, Zap } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function OpportunitySimulator({ profile }: { profile: any }) {
  const [scenario, setScenario] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const simulate = async () => {
    if (!scenario.trim() || !profile) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/gemini/opportunity-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile, 
          scenarios: [scenario], 
          currentScore: profile.opportunityScore || 50 
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(JSON.parse(data.text.replace(/```json/g, '').replace(/```/g, '').trim()));
      }
    } catch (err) {
      toast("Simulation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Opportunity Simulator</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">Type a scenario (e.g., "Learn React and build 2 projects") to see how it impacts your score.</p>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={scenario}
          onChange={e => setScenario(e.target.value)}
          placeholder="What if I..."
          className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button 
          onClick={simulate}
          disabled={loading || !scenario}
          className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center shrink-0 w-24"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simulate'}
        </button>
      </div>

      {result && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-amber-900 dark:text-amber-500">Predicted Impact</h3>
            <div className="flex items-center gap-1 font-bold text-lg text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              {result.predictedScore}
            </div>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-400/80 mb-3">{result.explanation}</p>
          {result.recommendedActions && (
             <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-900/50">
               <span className="text-xs font-bold text-amber-700 dark:text-amber-600">Recommended Steps:</span>
               <ul className="list-disc pl-4 text-xs text-amber-800 dark:text-amber-400/80 mt-1 space-y-1">
                 {result.recommendedActions.map((act: string, i: number) => <li key={i}>{act}</li>)}
               </ul>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
