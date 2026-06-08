import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, ScholarshipMatch } from '../types';
import { GraduationCap, Filter, Sparkles, Loader2, DollarSign, Globe, ChevronRight } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function Scholarships() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    educationLevel: 'All',
    targetCountry: 'All',
    coverage: 'All'
  });

  useEffect(() => {
    async function loadData() {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data() as UserProfile & { 
            scholarshipMatches?: ScholarshipMatch[], 
            scholarshipProfileSnapshot?: string 
          };
          setProfile(data);
          if (data.scholarshipMatches) {
            setMatches(data.scholarshipMatches);
          }
        }
      }
    }
    loadData();
  }, [user]);

  const findScholarships = async (forceRegenerate = false) => {
    if (!profile || !user) return;
    
    const currentProfileSnapshot = JSON.stringify({
      skills: profile.skills,
      interests: profile.interests,
      targetCountry: profile.targetCountry,
      educationLevel: profile.educationLevel
    });

    // Use cache if not forced and profile hasn't changed significantly
    if (!forceRegenerate && matches.length > 0) {
       const savedSnapshot = (profile as any).scholarshipProfileSnapshot;
       if (savedSnapshot === currentProfileSnapshot) {
         toast("Using cached scholarship recommendations.", "info");
         return;
       }
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/gemini/scholarships', {
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
          console.error("Failed to parse AI response:", parseError, data.text);
          toast("Failed to parse AI response. Please try again.", "error");
          setIsSearching(false);
          return;
        }

        if (result && result.scholarships) {
          setMatches(result.scholarships);
          
          // Cache in Firestore
          await updateDoc(doc(db, 'users', user.uid), {
             scholarshipMatches: result.scholarships,
             scholarshipProfileSnapshot: currentProfileSnapshot
          });
          toast("Successfully fetched new scholarships!", "success");
        } else {
          toast("AI returned an invalid format.", "error");
        }
      } else {
        toast("Server failed to generate scholarships.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An unexpected connection error occurred.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (profile && matches.length === 0 && !isSearching) {
      findScholarships(false);
    }
  }, [profile]);

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Main Content (Center) */}
      <div className="flex-1 overflow-y-auto pr-2 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Scholarship Matches</h1>
            <p className="text-slate-500 mt-1">Opportunities tailored to your profile.</p>
          </div>
          <button 
            onClick={() => findScholarships(true)}
            className="md:hidden flex items-center justify-center p-2 bg-slate-100 rounded-xl hover:bg-slate-200"
          >
            <Sparkles className="w-5 h-5 text-primary" />
          </button>
        </div>

        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
             <p className="text-slate-600 font-medium">Hunting for scholarships...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-primary/20 transition group">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                       <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-md border border-teal-100">
                         {match.match}% Match
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{match.name}</h3>
                    <p className="text-sm text-slate-600 mb-4">{match.eligibility}</p>
                    
                    <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                        {match.coverage}
                      </div>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-1 text-slate-400" />
                        Global / Remote
                      </div>
                    </div>
                  </div>
                  <button className="self-end sm:self-center shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-primary group-hover:bg-primary group-hover:text-white transition">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center">
             <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-500">No scholarships found yet.</p>
          </div>
        )}
      </div>

      {/* Filter Panel (Right Sidebar) */}
      <div className="w-full md:w-80 shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-4">
          <div className="flex items-center space-x-2 mb-6 text-slate-900">
            <Filter className="w-5 h-5" />
            <h2 className="font-bold">Filters</h2>
          </div>

          <div className="space-y-5 text-sm">
            <div>
              <label className="block font-medium text-slate-700 mb-2">Education Level</label>
              <select 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary"
                value={filters.educationLevel}
                onChange={e => setFilters({...filters, educationLevel: e.target.value})}
              >
                <option value="All">All Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Master">Master's</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-2">Target Country</label>
              <select 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary"
                value={filters.targetCountry}
                onChange={e => setFilters({...filters, targetCountry: e.target.value})}
              >
                <option value="All">Anywhere</option>
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="EU">Europe</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-2">Coverage</label>
              <select 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary"
                value={filters.coverage}
                onChange={e => setFilters({...filters, coverage: e.target.value})}
              >
                <option value="All">All Types</option>
                <option value="Full">Full Tuition + Stipend</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            
            <button 
              onClick={findScholarships}
              className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-blue-700 transition flex justify-center items-center mt-6"
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Filters"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
