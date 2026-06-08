import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { user, profileExists, signInWithGoogle, loading } = useAuth();

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

  if (user) {
    if (!profileExists) {
      return <Navigate to="/setup" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30">
            L
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          LUMORA AI
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          AI-Powered Student Career & Scholarship Assistant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700">
          <div className="space-y-6">
            <div>
              <button
                onClick={signInWithGoogle}
                className="w-full flex justify-center items-center py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                />
                Continue with Google
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Access Your Future
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
