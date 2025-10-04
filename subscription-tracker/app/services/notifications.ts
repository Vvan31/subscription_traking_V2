import { db } from '../utils/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Subscription, NotificationPreference } from '../utils/types';

// Add notification preference for a user
export const addNotificationPreference = async (
  userId: string, 
  preference: NotificationPreference
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'notificationPreferences'), {
      ...preference,
      userId,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding notification preference:', error);
    throw error;
  }
};

// Get notification preferences for a user
export const getUserNotificationPreferences = async (
  userId: string
): Promise<NotificationPreference[]> => {
  try {
    const q = query(
      collection(db, 'notificationPreferences'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const preferences: NotificationPreference[] = [];
    
    querySnapshot.forEach((doc) => {
      preferences.push({
        id: doc.id,
        ...doc.data()
      } as NotificationPreference);
    });
    
    return preferences;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw error;
  }
};

// Update notification preference
export const updateNotificationPreference = async (
  id: string,
  data: Partial<NotificationPreference>
): Promise<void> => {
  try {
    const docRef = doc(db, 'notificationPreferences', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating notification preference:', error);
    throw error;
  }
};

// Delete notification preference
export const deleteNotificationPreference = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'notificationPreferences', id));
  } catch (error) {
    console.error('Error deleting notification preference:', error);
    throw error;
  }
};

// Check for upcoming subscription payments
export const checkUpcomingPayments = async (userId: string): Promise<Subscription[]> => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const subscriptions: Subscription[] = [];
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    querySnapshot.forEach((doc) => {
      const subscription = {
        id: doc.id,
        ...doc.data()
      } as Subscription;
      
      // Convert Firestore timestamp to Date
      const paymentDate = subscription.paymentDate instanceof Date 
        ? subscription.paymentDate 
        : new Date(subscription.paymentDate);
      
      // Check if payment is due within the next 7 days
      if (paymentDate >= today && paymentDate <= nextWeek) {
        subscriptions.push({
          ...subscription,
          paymentDate
        });
      }
    });
    
    return subscriptions;
  } catch (error) {
    console.error('Error checking upcoming payments:', error);
    throw error;
  }
};

// Send notification (mock implementation - would connect to a real notification service)
export const sendNotification = async (
  userId: string,
  message: string,
  type: 'email' | 'push' | 'telegram' = 'email'
): Promise<boolean> => {
  try {
    // In a real implementation, this would connect to a notification service
    console.log(`Sending ${type} notification to user ${userId}: ${message}`);
    
    // Mock successful notification
    await addDoc(collection(db, 'sentNotifications'), {
      userId,
      message,
      type,
      sentAt: new Date(),
      status: 'sent'
    });
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    
    // Log failed notification
    await addDoc(collection(db, 'sentNotifications'), {
      userId,
      message,
      type,
      sentAt: new Date(),
      status: 'failed',
      error: JSON.stringify(error)
    });
    
    throw error;
  }
};