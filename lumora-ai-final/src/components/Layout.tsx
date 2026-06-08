import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { user, profileExists, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
         <div className="flex flex-col items-center animate-pulse">
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-primary/40 relative mb-6">
              L
              <div className="absolute inset-0 rounded-3xl border-4 border-primary/30 animate-ping"></div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              LUMORA AI
            </h2>
         </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profileExists) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-900 !text-slate-900 dark:!text-slate-100 transition-colors duration-200">
      <Sidebar />
      
      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative z-50 flex h-full">
            <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 relative overflow-y-auto custom-scrollbar focus:outline-none p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
