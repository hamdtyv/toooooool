import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInAnonymously } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from '../services/firebase';
import { loadUserApiKeys } from '../services/apiKeyService';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        loadUserApiKeys(firebaseUser.uid);
        setLoading(false);
      } else {
        const savedGuest = localStorage.getItem('muthaqaf_simulated_guest');
        if (savedGuest) {
          try {
            const parsed = JSON.parse(savedGuest);
            setUser(parsed);
            loadUserApiKeys(parsed.uid || 'guest_user');
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('muthaqaf_simulated_guest');
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInAsGuest = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('muthaqaf_simulated_guest');
      try {
        const result = await signInAnonymously(auth);
        setUser(result.user);
      } catch (fbErr) {
        console.warn("Firebase Anonymous Auth not enabled or failed, falling back to simulated guest:", fbErr);
        const simulatedUser = {
          uid: 'guest_' + Math.random().toString(36).substring(2, 11),
          email: 'guest@muthaqaf.local',
          displayName: 'Guest / زائر مُثقف',
          photoURL: '',
          isAnonymous: true,
          metadata: { creationTime: new Date().toISOString() }
        } as any as FirebaseUser;
        
        localStorage.setItem('muthaqaf_simulated_guest', JSON.stringify(simulatedUser));
        setUser(simulatedUser);
      }
    } catch (err) {
      console.error("Guest Sign-in failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('muthaqaf_simulated_guest');
      await logOut();
      setUser(null);
    } catch (err) {
      console.error("Sign out failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn: handleSignIn, signInAsGuest: handleSignInAsGuest, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
