'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSubscription, updateSubscription } from '@/app/services/subscriptions';
import SubscriptionForm from '@/app/components/subscription/SubscriptionForm';
import { Subscription } from '@/app/utils/types';
import { useAuth } from '@/app/hooks/useAuth';

export default function EditSubscriptionPage({ params }: { params: { id: string } }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();
  const { id } = params;

  useEffect(() => {
    async function loadSubscription() {
      if (!user) return;
      
      try {
        const data = await getSubscription(id);
        
        // Verify ownership
        if (data.userId !== user.uid) {
          setError('You do not have permission to edit this subscription');
          setIsLoading(false);
          return;
        }
        
        setSubscription(data);
      } catch (err) {
        console.error('Error loading subscription:', err);
        setError('Failed to load subscription details');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadSubscription();
    } else if (!loading) {
      router.push('/login');
    }
  }, [id, user, loading, router]);

  const handleSubmit = async (data: Partial<Subscription>) => {
    if (!user || !subscription) return;

    setIsSaving(true);
    setError(null);

    try {
      await updateSubscription(id, {
        ...data,
        userId: user.uid,
        updatedAt: new Date(),
      });
      
      router.push('/subscriptions');
      router.refresh();
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError('Failed to update subscription. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => router.push('/subscriptions')}
          className="text-blue-500 hover:text-blue-700"
        >
          Back to Subscriptions
        </button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Subscription not found
        </div>
        <button 
          onClick={() => router.push('/subscriptions')}
          className="text-blue-500 hover:text-blue-700"
        >
          Back to Subscriptions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Subscription</h1>
      
      <SubscriptionForm 
        initialData={subscription}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />
    </div>
  );
}