import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, RequireAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './hooks/useToast';
import Layout from './components/Layout';
import Login from './pages/Login';
import SetupProfile from './pages/SetupProfile';
import Dashboard from './pages/Dashboard';
import CareerAnalyzer from './pages/CareerAnalyzer';
import Scholarships from './pages/Scholarships';
import Settings from './pages/Settings';
import History from './pages/History';
import CvAssistant from './pages/CvAssistant';
import StudyPlanner from './pages/StudyPlanner';
import PortfolioBuilder from './pages/PortfolioBuilder';
import MockInterview from './pages/MockInterview';

// Placeholder Pages
const FuturePage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
      <p>This module is currently under development.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<SetupProfile />} />
              
              <Route element={<RequireAuth><Layout /></RequireAuth>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/career" element={<CareerAnalyzer />} />
                <Route path="/scholarships" element={<Scholarships />} />
                <Route path="/portfolio" element={<PortfolioBuilder />} />
                <Route path="/cv" element={<CvAssistant />} />
                <Route path="/study" element={<StudyPlanner />} />
                <Route path="/interview" element={<MockInterview />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

