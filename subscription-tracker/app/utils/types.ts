// Type definitions for the application

export type Subscription = {
  id: string;
  name: string;
  price: number;
  cycle: 'monthly' | 'yearly' | 'quarterly' | 'weekly';
  category: string;
  paymentDate: Date | string;
  notes?: string;
  logo?: string;
  createdAt: Date | string;
  userId: string;
};

export type User = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
};

export type NotificationPreference = {
  userId: string;
  telegramChatId?: string;
  whatsappNumber?: string;
  notifyDaysBefore: number;
  enabled: boolean;
};