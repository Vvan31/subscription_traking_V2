import { db } from '../utils/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Subscription } from '../utils/types';

// Collection reference
const subscriptionsCollection = collection(db, 'subscriptions');

// Create a new subscription
export const addSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(subscriptionsCollection, {
      ...subscription,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

// Get all subscriptions for a user
export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const q = query(subscriptionsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamp to Date
      const paymentDate = data.paymentDate instanceof Timestamp 
        ? data.paymentDate.toDate() 
        : new Date(data.paymentDate);
      
      const createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate() 
        : new Date(data.createdAt);
      
      return {
        id: doc.id,
        ...data,
        paymentDate,
        createdAt
      } as Subscription;
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    throw error;
  }
};

// Update a subscription
export const updateSubscription = async (id: string, data: Partial<Subscription>): Promise<void> => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', id);
    await updateDoc(subscriptionRef, data);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Delete a subscription
export const deleteSubscription = async (id: string): Promise<void> => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', id);
    await deleteDoc(subscriptionRef);
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};