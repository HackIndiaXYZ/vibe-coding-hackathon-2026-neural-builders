import { useDashboardData } from '../hooks/useDashboardData';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import { useAuth } from '../hooks/useAuth';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Compass, GraduationCap, Briefcase, FileText, BookOpen, Clock, Target, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WeeklyMissions from '../components/dashboard/WeeklyMissions';
import OpportunitySimulator from '../components/dashboard/OpportunitySimulator';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading } = useDashboardData(user?.uid);
  const { t } = useTranslation();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-900/30">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Profile</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Could not load your profile data or it was deleted.</p>
        <Link to="/setup" className="px-6 py-2 bg-primary text-white rounded-xl">Set up Profile</Link>
      </div>
    );
  }

  const isAnalyzing = profile.isAnalyzing;

  const scoreData = [
    { name: 'Score', value: profile.opportunityScore || 50, color: '#14B8A6' },
    { name: 'Remaining', value: 100 - (profile.opportunityScore || 50), color: '#334155' },
  ]; // Using a slightly darker remaining color, but typically handled by dark mode differently

  const quickLinks = [
    { name: t('sidebar.career'), icon: Compass, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', to: '/career' },
    { name: t('sidebar.scholarships'), icon: GraduationCap, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', to: '/scholarships' },
    { name: t('sidebar.portfolio'), icon: Briefcase, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', to: '/portfolio' },
    { name: t('sidebar.cv'), icon: FileText, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', to: '/cv' },
    { name: t('sidebar.study'), icon: BookOpen, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', to: '/study' },
  ];

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  const name = profile.fullName ? profile.fullName.split(' ')[0] : 'User';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.greeting', { name })}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/40">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {t('dashboard.analyzing')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center md:col-span-1">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 self-start mb-4">{t('dashboard.opportunityScore')}</h2>
          {isAnalyzing ? (
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="w-40 h-40 border-8 border-slate-100 dark:border-slate-800 border-t-slate-200 dark:border-t-slate-700 rounded-full animate-spin flex items-center justify-center">
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <Loader2 className="w-8 h-8 text-slate-300 dark:text-slate-600 animate-spin" />
              </div>
            </div>
          ) : (
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{profile.opportunityScore || 50}</span>
                <span className="text-sm font-medium text-secondary">{getScoreLabel(profile.opportunityScore || 50)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Scores */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium text-sm">{t('dashboard.careerReadiness')}</h3>
            </div>
            {isAnalyzing ? (
              <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-1"></div>
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">75<span className="text-lg text-slate-400 dark:text-slate-500 font-normal">/100</span></div>
            )}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              {isAnalyzing ? (
                 <div className="w-full bg-slate-200 dark:bg-slate-700 h-full rounded-full animate-pulse"></div>
              ) : (
                 <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }}></div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mb-2">
              <GraduationCap className="w-5 h-5 text-teal-500" />
              <h3 className="font-medium text-sm">{t('dashboard.scholarshipReady')}</h3>
            </div>
            {isAnalyzing ? (
              <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-1"></div>
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">82<span className="text-lg text-slate-400 dark:text-slate-500 font-normal">/100</span></div>
            )}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              {isAnalyzing ? (
                 <div className="w-full bg-slate-200 dark:bg-slate-700 h-full rounded-full animate-pulse"></div>
              ) : (
                 <div className="bg-teal-500 h-full rounded-full" style={{ width: '82%' }}></div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 mb-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              <h3 className="font-medium text-sm">{t('dashboard.portfolioStrength')}</h3>
            </div>
            {isAnalyzing ? (
              <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-1"></div>
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white">60<span className="text-lg text-slate-400 dark:text-slate-500 font-normal">/100</span></div>
            )}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              {isAnalyzing ? (
                 <div className="w-full bg-slate-200 dark:bg-slate-700 h-full rounded-full animate-pulse"></div>
              ) : (
                 <div className="bg-purple-500 h-full rounded-full" style={{ width: '60%' }}></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.quickAccess')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.name} to={link.to} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-md transition-all flex flex-col items-center text-center space-y-3 group">
                <div className={`p-3 rounded-xl ${link.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{link.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.careerInsights')}</h2>
            {!isAnalyzing && (
              <Link to="/career" className="text-sm text-primary font-medium hover:underline">{t('dashboard.viewAll')}</Link>
            )}
          </div>
          <div className="space-y-4">
            {isAnalyzing ? (
              <>
                <div className="h-24 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl animate-pulse"></div>
                <div className="h-24 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl animate-pulse"></div>
              </>
            ) : profile.careerRecommendations && profile.careerRecommendations.length > 0 ? (
              profile.careerRecommendations.slice(0, 2).map((rec: any, i: number) => (
                <div key={i} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rec.career}</h4>
                    <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold text-teal-600 dark:text-teal-400">{t('dashboard.match')} {rec.match}%</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{rec.reasoning}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.emptyInsights')}</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('dashboard.yourProgress')}</h2>
          <div className="space-y-3">
             {[
               { id: 'Profile Setup', text: t('dashboard.profileSetup') },
               { id: 'Career Analysis', text: t('dashboard.careerAnalysis') },
               { id: 'Scholarship Search', text: t('dashboard.scholarshipSearch') }
             ].map((step, idx) => {
               const isCompleted = profile.completedSteps?.includes(step.id);
               return (
                 <div key={idx} className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
                   {isCompleted ? (
                     <CheckCircle2 className="w-5 h-5 text-secondary" />
                   ) : (
                     <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                   )}
                   <span className="text-sm font-medium">{step.text}</span>
                 </div>
               );
             })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeeklyMissions />
        <OpportunitySimulator profile={profile} />
      </div>
    </div>
  );
}
