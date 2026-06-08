import { useAuth } from '../hooks/useAuth';
import { Search as SearchIcon, Menu as MenuIcon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './notifications/NotificationBell';
import { useTranslation } from 'react-i18next';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 lg:px-8 relative z-50">
      <div className="flex items-center space-x-4 flex-1">
        <button onClick={onMenuClick} className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="hidden md:flex relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-200 dark:text-slate-200"
            placeholder={t('header.search')}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <NotificationBell />
        
        <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="hidden md:block text-right">
            <div className="text-sm font-medium text-slate-900 dark:text-white">{user?.displayName || 'User'}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ''}</div>
          </div>
          <img
            className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + (user?.displayName || 'User') + '&background=2563EB&color=fff'}
            alt="User profile"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
