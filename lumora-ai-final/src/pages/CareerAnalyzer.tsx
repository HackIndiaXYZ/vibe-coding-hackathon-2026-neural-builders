import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, CareerRecommendation } from '../types';
import { CheckCircle2, ChevronRight, Briefcase, Sparkles, Loader2, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CareerPathDetails from '../components/career/CareerPathDetails';
import { useToast } from '../hooks/useToast';

export default function CareerAnalyzer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [hasNewResults, setHasNewResults] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile(data);
          if (data.careerRecommendations && data.careerRecommendations.length > 0) {
            setRecommendations(data.careerRecommendations);
          }
        }
      }
    }
    loadData();
  }, [user]);

  const analyzeCareer = async () => {
    if (!profile || !user) return;
    
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setRecommendations([]);
    
    // Simulate steps
    const steps = [
      "Reviewing education & major...",
      "Analyzing skill matching...",
      "Generating AI career paths...",
      "Finalizing recommendations..."
    ];
    
    for (let i = 0; i < steps.length; i++) {
        setAnalysisStep(i);
        await new Promise(r => setTimeout(r, 1000));
    }

    try {
      const response = await fetch('/api/gemini/analyze-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      
      const data = await response.json();
      if (data.success && data.text) {
        let result;
        try {
          const cleanedText = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
          result = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          toast("We encountered an error processing your career data. Please try again.", "error");
          return;
        }
        
        if (result && result.recommendations) {
          setRecommendations(result.recommendations);
          setHasNewResults(true);
        } else {
          toast("Invalid response from AI.", "error");
        }
      } else {
        toast("Server failed to respond.", "error");
      }
    } catch (error) {
      console.error("Analysis failed", error);
      toast("Connection to AI server failed.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveResults = async () => {
    if (!user || recommendations.length === 0) return;
    try {
      const isAlreadyCompleted = profile?.completedSteps?.includes('Career Analysis');
      const scoreAddition = isAlreadyCompleted ? 0 : 15;

      await updateDoc(doc(db, 'users', user.uid), {
        careerRecommendations: recommendations,
        completedSteps: Array.from(new Set([...(profile?.completedSteps || []), 'Career Analysis'])),
        opportunityScore: Math.min(100, (profile?.opportunityScore || 50) + scoreAddition)
      });
      setHasNewResults(false);
      toast('Results saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to save results.', 'error');
    }
  }

  if (!profile) return null;

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto py-20 px-4 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-12 h-12 text-primary animate-bounce" />
          </div>
          <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-white rounded-full p-1 shadow">
            <Loader2 className="w-6 h-6 text-secondary animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('career.analyzing')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Please wait a moment while our AI processes your background.</p>
        
        <div className="w-full space-y-4 text-left">
          {["Reviewing education & major", "Analyzing skill matching", "Generating AI career paths", "Finalizing recommendations"].map((step, index) => (
            <div key={index} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${index <= analysisStep ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'opacity-40'}`}>
              {index < analysisStep ? (
                <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" />
              ) : index === analysisStep ? (
                <Loader2 className="w-6 h-6 text-primary shrink-0 animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
              )}
              <span className={`font-medium ${index <= analysisStep ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500'}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('career.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">AI-powered insights based on your unique profile.</p>
        </div>
        {!hasNewResults && !selectedCareer && (
           <button 
             onClick={analyzeCareer}
             className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary hover:bg-blue-700 transition"
           >
             <Sparkles className="w-4 h-4 mr-2" />
             {recommendations.length > 0 ? "Re-analyze Profile" : t('career.analyzeBtn')}
           </button>
        )}
      </div>

      {selectedCareer ? (
        <CareerPathDetails 
          profile={profile} 
          targetCareer={selectedCareer} 
          onBack={() => setSelectedCareer(null)} 
        />
      ) : recommendations.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Career Recommendations</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-1">
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-6 group hover:border-primary/30 transition cursor-pointer" onClick={() => setSelectedCareer(rec.career)}>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition">{rec.career}</h3>
                    <div className="flex items-center space-x-1 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full border border-teal-100 dark:border-teal-900/50">
                      <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{t('career.match')} {rec.match}%</span>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{rec.reasoning}</p>
                </div>
                
                <div className="flex-shrink-0 md:pl-4 md:border-l border-slate-100 dark:border-slate-800">
                  <button className="flex items-center text-primary font-medium hover:text-blue-700 dark:hover:text-blue-400">
                    Explore <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasNewResults && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={saveResults}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-secondary hover:bg-teal-600 transition"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Save Result & Update Progress
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Analysis Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">{t('career.emptyState')}</p>
          <button 
             onClick={analyzeCareer}
             className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
           >
             Start First Analysis
           </button>
        </div>
      )}
    </div>
  );
}
