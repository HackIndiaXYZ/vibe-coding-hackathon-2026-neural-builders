import { useState, useEffect } from 'react';
import { Plus, Wand2, Loader2, Sparkles, FolderOpen, Github, ExternalLink, Activity, ArrowRight } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useToast } from '../hooks/useToast';

interface Project {
  id: string;
  title: string;
  role: string;
  technologies: string[];
  description: string;
  imageUrl?: string;
}

export default function PortfolioBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [techString, setTechString] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Eval State
  const [evalResult, setEvalResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'portfolio'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const projData: Project[] = [];
      snapshot.forEach((pDoc) => {
        projData.push({ id: pDoc.id, ...pDoc.data() } as Project);
      });
      setProjects(projData);
    }, (error) => {
      console.error("Error in PortfolioBuilder snapshot:", error);
    });
    return () => unsub();
  }, [user]);

  const evaluatePortfolio = async () => {
    if (!user || projects.length === 0) {
      toast("Add some projects before evaluating.", "warning");
      return;
    }
    setIsEvaluating(true);
    setEvalResult(null);
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const profile = snap.exists() ? snap.data() : {};
      
      const res = await fetch('/api/gemini/portfolio-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, portfolioItems: projects })
      });
      const data = await res.json();
      if (data.success && data.text) {
        setEvalResult(JSON.parse(data.text.replace(/```json/g, '').replace(/```/g, '').trim()));
        toast("Evaluation completed successfully!", "success");
      } else {
        toast("Failed to evaluate portfolio.", "error");
      }
    } catch (err) {
      toast("Error parsing evaluation response.", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  const generateDescription = async () => {
    if (!title || !role) return;
    setIsGenerating(true);
    try {
      const technologies = techString.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/gemini/portfolio-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, role, technologies })
      });
      const data = await res.json();
      if (data.success && data.text) {
        setDescription(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title || !description || !user) return;
    setIsSaving(true);
    try {
      const technologies = techString.split(',').map(t => t.trim()).filter(Boolean);
      await addDoc(collection(db, 'users', user.uid, 'portfolio'), {
        title,
        role,
        technologies,
        description,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setRole('');
      setTechString('');
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Builder</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and showcase your best work</p>
        </div>
        <div className="flex gap-3">
          {projects.length > 0 && (
            <button 
              onClick={evaluatePortfolio}
              disabled={isEvaluating}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors flex items-center shadow-sm disabled:opacity-50"
            >
              {isEvaluating ? <Loader2 className="w-5 h-5 mr-1.5 animate-spin" /> : <Activity className="w-5 h-5 mr-1.5" />}
              Evaluate Score
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            Add Project
          </button>
        </div>
      </div>

      {evalResult && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-4 border-indigo-200 dark:border-indigo-800 shrink-0">
               <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{evalResult.score}</span>
            </div>
            <div className="flex-1">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Portfolio Assessment</h3>
               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{evalResult.assessment}</p>
               
               <div className="grid md:grid-cols-2 gap-4">
                 {evalResult.missingSections && evalResult.missingSections.length > 0 && (
                   <div>
                     <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Missing Elements</h4>
                     <ul className="space-y-1">
                       {evalResult.missingSections.map((u: string, i: number) => <li key={i} className="text-xs text-rose-600 dark:text-rose-400 flex items-center">- {u}</li>)}
                     </ul>
                   </div>
                 )}
                 {evalResult.suggestions && evalResult.suggestions.length > 0 && (
                   <div>
                     <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Improvement Tips</h4>
                     <ul className="space-y-1">
                       {evalResult.suggestions.slice(0,3).map((s: string, i: number) => <li key={i} className="text-xs text-indigo-700 dark:text-indigo-300 flex items-start break-words"><ArrowRight className="w-3 h-3 mr-1 mt-0.5 shrink-0" /> {s}</li>)}
                     </ul>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
           <div className="col-span-full">
             <EmptyState 
               icon={FolderOpen} 
               title="No projects yet" 
               description="Build your portfolio by adding your past work, side projects, and capstone assignments." 
               actionText="Add your first project" 
               onAction={() => setIsModalOpen(true)} 
             />
           </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 backdrop-blur-sm">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 backdrop-blur-sm">
                    <Github className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{project.title}</h3>
                <p className="text-xs font-semibold text-primary mt-1">{project.role}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-3 leading-relaxed flex-1">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {project.technologies.slice(0, 3).map((tech, i) => (
                    <span key={i} className="px-2 py-1 text-[10px] font-bold tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 text-[10px] font-bold tracking-wide uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-500 rounded-md border border-slate-200 dark:border-slate-700">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finance Dashboard" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Your Role</label>
                  <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Developer" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Technologies Used (comma separated)</label>
                 <input type="text" value={techString} onChange={(e) => setTechString(e.target.value)} placeholder="React, Node.js, Tailwind..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:outline-none" />
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project Description</label>
                  <button 
                    onClick={generateDescription}
                    disabled={isGenerating || !title || !role}
                    className="text-xs font-semibold text-primary flex items-center hover:text-blue-700 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    Auto-write with AI
                  </button>
                </div>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe your project's goal, challenges, and outcome..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Cancel</button>
              <button 
                onClick={handleSave}
                disabled={isSaving || !title || !description}
                className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 flex items-center shadow-sm"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
