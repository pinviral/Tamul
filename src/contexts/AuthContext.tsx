import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  plan: 'free' | 'pro';
  dailyMessagesCount: number;
  lastResetDate: string;
  streak: number;
  lastActive: string;
  totalMeditationsCompleted: number;
  totalCoachMessages: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) {
        await fetchOrCreateProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchOrCreateProfile = async (currentUser: User) => {
    if (!db) return;
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      const today = new Date().toISOString().split('T')[0];

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Reset daily limits if it's a new day
        let updates: Partial<UserProfile> = {};
        if (data.lastResetDate !== today) {
          updates.dailyMessagesCount = 0;
          updates.lastResetDate = today;
          
          // Calculate streak
          const lastActiveDate = new Date(data.lastActive);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastActiveDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            updates.streak = data.streak + 1;
          } else if (diffDays > 1) {
            updates.streak = 0;
          }
        }
        
        updates.lastActive = today;
        
        if (Object.keys(updates).length > 0) {
          await setDoc(docRef, updates, { merge: true });
          setProfile({ ...data, ...updates });
        } else {
          setProfile(data);
        }
      } else {
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'مستخدم جديد',
          plan: 'free',
          dailyMessagesCount: 0,
          lastResetDate: today,
          streak: 0,
          lastActive: today,
          totalMeditationsCompleted: 0,
          totalCoachMessages: 0
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching/creating profile:", error);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      alert("Firebase is not configured. Please check your settings.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile || !db) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, data, { merge: true });
      setProfile({ ...profile, ...data });
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
