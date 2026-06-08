import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

export default function SetupProfile() {
  const { user, profileExists, setProfileExists, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: user?.displayName || '',
    educationLevel: 'University',
    major: '',
    skills: [],
    targetCountry: ''
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (profileExists) return <Navigate to="/" replace />;

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills?.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...(formData.skills || []), skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills?.filter(skill => skill !== skillToRemove) || []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const profileData: UserProfile = {
        fullName: formData.fullName || '',
        educationLevel: formData.educationLevel || '',
        major: formData.major || '',
        skills: formData.skills || [],
        targetCountry: formData.targetCountry || '',
        opportunityScore: 0,
        completedSteps: ['Profile Setup'],
        isAnalyzing: true,
      };
      
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, profileData);
      
      setProfileExists(true);
      navigate('/');
    } catch (error) {
      console.error("Error saving profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-xl w-full space-y-8 bg-surface p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configure Your Profile</h2>
          <p className="mt-2 text-slate-600">Help LUMORA AI understand your background to give the best recommendations.</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                id="fullName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="educationLevel" className="block text-sm font-medium text-slate-700">Education Level</label>
              <select
                id="educationLevel"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white"
                value={formData.educationLevel}
                onChange={e => setFormData({...formData, educationLevel: e.target.value})}
              >
                <option value="High School">High School</option>
                <option value="University">Undergraduate / University</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="major" className="block text-sm font-medium text-slate-700">Major / Field of Study</label>
              <input
                id="major"
                type="text"
                required
                placeholder="e.g. Computer Science"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.major}
                onChange={e => setFormData({...formData, major: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-slate-700">Skills (Press Enter to add)</label>
              <div className="mt-1 flex space-x-2">
                <input
                  id="skills"
                  type="text"
                  placeholder="e.g. Python, UI/UX"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  autoComplete="off"
                />
                <button 
                  type="button" 
                  onClick={() => handleAddSkill({ key: 'Enter', preventDefault: () => {} } as any)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.skills?.map(skill => (
                  <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary hover:bg-primary/20 hover:text-primary-800 focus:outline-none focus:bg-primary-200 focus:text-primary-500">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="targetCountry" className="block text-sm font-medium text-slate-700">Target Country for Study/Work</label>
              <input
                id="targetCountry"
                type="text"
                placeholder="e.g. United States, Germany"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={formData.targetCountry}
                onChange={e => setFormData({...formData, targetCountry: e.target.value})}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
