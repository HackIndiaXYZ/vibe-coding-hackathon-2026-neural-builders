import { NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { navLinks } from './navigation/NavLinks';

export default function Sidebar({ mobile, onClose }: { mobile?: boolean, onClose?: () => void }) {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className={`w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full ${mobile ? 'flex' : 'hidden md:flex'}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold shadow-sm">
            L
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LUMORA AI</span>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 md:hidden">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              onClick={mobile ? onClose : undefined}
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.name)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
}
