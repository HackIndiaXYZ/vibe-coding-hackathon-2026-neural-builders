import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profileExists: boolean;
  setProfileExists: (exists: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const docRef = doc(db, 'users', authUser.uid);
          const docSnap = await getDoc(docRef);
          setProfileExists(docSnap.exists());
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfileExists(false);
        }
        setUser(authUser);
      } else {
        setUser(null);
        setProfileExists(false);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    // SARAN 1: Clear state/cache on logout
    localStorage.clear();
    sessionStorage.clear();
    setProfileExists(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, profileExists, setProfileExists, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected Route Wrapper
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, profileExists, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // SARAN 2: Splash Screen
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profileExists) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}
