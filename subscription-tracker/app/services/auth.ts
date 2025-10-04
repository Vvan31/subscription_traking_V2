import { auth } from '../utils/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { User } from '../utils/types';

// Google Sign-In
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || undefined
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
};

// Listen to auth state changes
export const onAuthStateChangedHelper = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || undefined
      };
      callback(user);
    } else {
      callback(null);
    }
  });
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }
};