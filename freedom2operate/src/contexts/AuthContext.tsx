import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FirebaseError } from 'firebase/app';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface UserProfile {
  displayName?: string;
  phone?: string;
  company?: string;
  email: string;
  createdAt: string;
  lastLoginAt?: string;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  signup: (email: string, password: string, profileData?: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = doc(db, 'users', uid);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setUserProfile(profile);
        setIsAdmin(profile.role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signup = async (email: string, password: string, profileData?: Partial<UserProfile>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Store additional user data in Firestore
      const userData: UserProfile = {
        email,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        role: 'user',  // Set default role
        ...profileData
      };
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, userData);
      setUserProfile(userData);
      setIsAdmin(userData.role === 'admin');
    } catch (error) {
      console.error('Error signing up:', error);
      if (error instanceof Error) {
        const authError = error as FirebaseError;
        console.error('Firebase error code:', authError.code);
        console.error('Firebase error message:', authError.message);
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user profile first
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      // Update last login time
      await updateDoc(userRef, {
        lastLoginAt: new Date().toISOString()
      });

      // Set user profile in state
      const profile = userDoc.data() as UserProfile;
      setUserProfile(profile);
      setIsAdmin(profile.role === 'admin');

    } catch (error) {
      console.error('Error logging in:', error);
      if (error instanceof Error) {
        const authError = error as FirebaseError;
        console.error('Firebase error code:', authError.code);
        console.error('Firebase error message:', authError.message);
      }
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('No authenticated user');
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, profileData);
      if (userProfile) {
        setUserProfile({ ...userProfile, ...profileData });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    updateProfile,
    loading,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
