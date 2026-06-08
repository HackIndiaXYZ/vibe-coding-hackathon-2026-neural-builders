import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionText, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
        {description}
      </p>
      
      {actionText && (
        actionHref ? (
          <Link 
            to={actionHref}
            className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition text-sm"
          >
            {actionText}
          </Link>
        ) : (
          <button 
            onClick={onAction}
            className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-medium rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition text-sm"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
