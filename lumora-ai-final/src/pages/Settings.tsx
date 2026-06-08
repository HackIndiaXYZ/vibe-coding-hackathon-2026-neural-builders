import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const exportData: any = { profile: null, history: [], portfolio: [] };
      const profileSnap = await getDoc(doc(db, 'users', user.uid));
      if (profileSnap.exists()) exportData.profile = profileSnap.data();

      const historySnap = await getDocs(collection(db, 'users', user.uid, 'history'));
      historySnap.forEach(d => exportData.history.push(d.data()));

      const portfolioSnap = await getDocs(collection(db, 'users', user.uid, 'portfolio'));
      portfolioSnap.forEach(d => exportData.portfolio.push(d.data()));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumora_data_${user.uid}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      // 1. Delete Firestore user document (this won't automatically delete subcollections in Firestore, you'd usually use a cloud function, but we delete the root to reset profileExists)
      await deleteDoc(doc(db, 'users', user.uid));
      
      // 2. Delete user from Firebase Auth
      await deleteUser(user);
      
      // 3. Logout (clears state and cache as we implemented in useAuth earlier)
      await logout();
      
      // 4. Redirect
      navigate('/login');
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. You might need to re-authenticate first.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 p-4">
          <nav className="space-y-1">
            {[
              { id: 'account', label: t('settings.accountProfile') || 'Account Profile' },
              { id: 'security', label: t('settings.security') || 'Security' },
              { id: 'privacy', label: 'Privacy & Data' },
              { id: 'preferences', label: t('settings.preferences') || 'Preferences' },
              { id: 'notifications', label: t('settings.notifications') || 'Notifications' }
            ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                    activeTab === id
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm border border-slate-200 dark:border-slate-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Details</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update your account information.</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <img src={user?.photoURL || ''} alt="Avatar" className="w-20 h-20 rounded-full border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
                  Change Avatar
                </button>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" defaultValue={user?.displayName || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" disabled defaultValue={user?.email || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                </div>
                <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Display & Theme</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Customize your app appearance.</p>
              </div>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Color Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t as 'light'|'dark'|'system')}
                        className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all ${theme === t ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'}`}
                      >
                        <span className="capitalize text-sm font-medium">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('settings.language')}</label>
                  <select 
                    value={i18n.language}
                    onChange={handleLanguageChange}
                    className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="en">English (US)</option>
                    <option value="id">Indonesian</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Privacy & Data Management</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Control your personal data and account status.</p>
              </div>
              
              <div className="space-y-4 max-w-md">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Export Data</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Download a copy of your personal data, past analysis, and history.</p>
                  <button 
                    onClick={handleExportData} 
                    disabled={isExporting}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                  >
                    {isExporting ? 'Preparing Download...' : 'Download My Data'}
                  </button>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-200 dark:border-red-900/30">
                  <h3 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-xs text-red-600 dark:text-red-400/80 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Security Settings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password and security.</p>
              </div>
              
              <div className="space-y-4 max-w-md">
                <p className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  You are currently logged in with Google Authentication. Password changes are managed through your Google Account.
                </p>
              </div>
            </div>
          )}

           {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Controls</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose what updates you want to receive.</p>
              </div>
              
              <div className="space-y-4 max-w-md divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { title: "Push Notifications", desc: "Receive alerts directly in the browser.", enabled: true },
                  { title: "Email Updates", desc: "Weekly summaries of new scholarships.", enabled: false },
                  { title: "AI Analysis Complete", desc: "Notify when background AI tasks finish.", enabled: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <button className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${item.enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <span className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Account</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                This action is permanent and cannot be undone. All your data, including profile, history, portfolio, and settings will be removed forever.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Type <strong className="text-slate-900 dark:text-white">DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
