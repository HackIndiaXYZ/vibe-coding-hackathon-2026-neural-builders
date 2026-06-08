import { Loader2 } from 'lucide-react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="space-y-3">
          <div className="h-7 w-48 bg-slate-200 rounded"></div>
          <div className="h-4 w-64 bg-slate-100 rounded"></div>
        </div>
        <div className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          AI is analyzing your profile...
        </div>
      </div>

      {/* Main Scores Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center md:col-span-1">
          <div className="h-6 w-32 bg-slate-200 rounded self-start mb-4"></div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="w-40 h-40 border-8 border-slate-100 border-t-slate-200 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-16 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
              <div className="h-5 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="h-8 w-16 bg-slate-200 rounded mb-3"></div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-200 h-full w-1/2 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Features and Insights Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl"></div>
            <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-6 w-full bg-slate-100 rounded"></div>
            <div className="h-6 w-3/4 bg-slate-100 rounded"></div>
            <div className="h-6 w-5/6 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
