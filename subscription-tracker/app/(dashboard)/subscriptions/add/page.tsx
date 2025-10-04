'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addSubscription } from '@/app/services/subscriptions';
import SubscriptionForm from '@/app/components/subscription/SubscriptionForm';
import { Subscription } from '@/app/utils/types';
import { useAuth } from '@/app/hooks/useAuth';

export default function AddSubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleSubmit = async (data: Partial<Subscription>) => {
    if (!user) {
      setError('You must be logged in to add a subscription');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addSubscription({
        ...data,
        userId: user.uid,
        createdAt: new Date(),
      } as Subscription);
      
      router.push('/subscriptions');
      router.refresh();
    } catch (err) {
      console.error('Error adding subscription:', err);
      setError('Failed to add subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Add New Subscription</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <SubscriptionForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}