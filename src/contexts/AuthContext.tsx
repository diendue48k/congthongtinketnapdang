import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';

interface UserProfile {
  uid: string;
  email: string;
  role: 'student' | 'admin';
  studentId?: string;
  cccd?: string;
  phone?: string;
  fullName?: string;
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          unsubscribeProfile = onSnapshot(userDocRef, async (userDoc) => {
            if (userDoc.exists()) {
              console.log('User profile found in AuthContext');
              const data = userDoc.data() as UserProfile;
              const userEmail = firebaseUser.email?.toLowerCase();
              
              let isAdmin = false;
              if (userEmail) {
                const adminEmailsRef = collection(db, 'admin_emails');
                const q = query(adminEmailsRef, where('email', '==', userEmail));
                const querySnapshot = await getDocs(q);
                isAdmin = !querySnapshot.empty || userEmail === 'levinhdienthptbenhai@gmail.com' || userEmail === 'levinhdien9bthcschuvanan@gmail.com';
              }

              if (isAdmin && data.role !== 'admin') {
                data.role = 'admin';
                await setDoc(userDocRef, { role: 'admin' }, { merge: true });
              }

              // If profile is missing fullName or studentId, try to fetch from application
              if (!data.fullName || !data.studentId) {
                const q = query(collection(db, 'applications'), where('userId', '==', firebaseUser.uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  const appData = querySnapshot.docs[0].data();
                  const updates: any = {};
                  if (!data.fullName && appData.basicInfo?.fullName) {
                    updates.fullName = appData.basicInfo.fullName.toUpperCase();
                    data.fullName = updates.fullName;
                  }
                  if (!data.studentId && appData.basicInfo?.studentId) {
                    updates.studentId = appData.basicInfo.studentId;
                    data.studentId = updates.studentId;
                  }
                  if (Object.keys(updates).length > 0) {
                    await setDoc(userDocRef, updates, { merge: true });
                  }
                }
              }

              setProfile(data);
              setLoading(false);
            } else {
              console.log('User profile NOT found in AuthContext, waiting for creation or creating default...');
              // We don't immediately create a default profile here because Register.tsx might be in the middle of creating it.
              // Wait a bit, if still not created, then create default.
              setTimeout(async () => {
                const checkDoc = await getDoc(userDocRef);
                if (!checkDoc.exists()) {
                  const userEmail = firebaseUser.email?.toLowerCase() || '';
                  let isAdmin = false;
                  if (userEmail) {
                    const adminEmailsRef = collection(db, 'admin_emails');
                    const q = query(adminEmailsRef, where('email', '==', userEmail));
                    const querySnapshot = await getDocs(q);
                    isAdmin = !querySnapshot.empty || userEmail === 'levinhdienthptbenhai@gmail.com' || userEmail === 'levinhdien9bthcschuvanan@gmail.com';
                  }

                  const newProfile: UserProfile = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    role: isAdmin ? 'admin' : 'student',
                    createdAt: new Date().toISOString(),
                  };
                  await setDoc(userDocRef, newProfile);
                  // The onSnapshot will trigger and set the profile
                }
              }, 2000);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
            setLoading(false);
          });

        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
