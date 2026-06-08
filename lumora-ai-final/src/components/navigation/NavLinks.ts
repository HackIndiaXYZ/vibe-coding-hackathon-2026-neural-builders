import { LayoutDashboard, Compass, GraduationCap, Briefcase, FileText, BookOpen, Clock, Settings, MessageSquare } from 'lucide-react';

export const navLinks = [
  { name: 'sidebar.dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'sidebar.career', icon: Compass, path: '/career' },
  { name: 'sidebar.scholarships', icon: GraduationCap, path: '/scholarships' },
  { name: 'sidebar.portfolio', icon: Briefcase, path: '/portfolio' },
  { name: 'sidebar.cv', icon: FileText, path: '/cv' },
  { name: 'sidebar.study', icon: BookOpen, path: '/study' },
  { name: 'sidebar.interview', icon: MessageSquare, path: '/interview' },
  { name: 'sidebar.history', icon: Clock, path: '/history' },
  { name: 'sidebar.settings', icon: Settings, path: '/settings' },
];
