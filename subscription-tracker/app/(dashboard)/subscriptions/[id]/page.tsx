'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSubscription, deleteSubscription } from '@/app/services/subscriptions';
import { Subscription } from '@/app/utils/types';
import { useAuth } from '@/app/hooks/useAuth';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import { FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';

export default function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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
          setError('You do not have permission to view this subscription');
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSubscription(id);
      router.push('/subscriptions');
      router.refresh();
    } catch (err) {
      console.error('Error deleting subscription:', err);
      setError('Failed to delete subscription');
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
        <Link href="/subscriptions" className="text-blue-500 hover:text-blue-700 flex items-center">
          <FiArrowLeft className="mr-2" /> Back to Subscriptions
        </Link>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Subscription not found
        </div>
        <Link href="/subscriptions" className="text-blue-500 hover:text-blue-700 flex items-center">
          <FiArrowLeft className="mr-2" /> Back to Subscriptions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{subscription.name}</h1>
        <div className="flex space-x-2">
          <Link href={`/subscriptions/${id}/edit`}>
            <Button variant="outline" className="flex items-center">
              <FiEdit2 className="mr-2" /> Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            className="flex items-center" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                Deleting...
              </>
            ) : (
              <>
                <FiTrash2 className="mr-2" /> Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <Link href="/subscriptions" className="text-blue-500 hover:text-blue-700 flex items-center mb-6">
        <FiArrowLeft className="mr-2" /> Back to Subscriptions
      </Link>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Price</h3>
            <p className="text-lg font-semibold">{formatCurrency(subscription.price)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Billing Cycle</h3>
            <p className="text-lg font-semibold capitalize">{subscription.cycle}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p className="text-lg font-semibold">{subscription.category}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Payment Date</h3>
            <p className="text-lg font-semibold">{formatDate(subscription.paymentDate)}</p>
          </div>
          {subscription.notes && (
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{subscription.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Payment Schedule</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => {
            const paymentDate = new Date(subscription.paymentDate);
            
            // Calculate next payment dates based on cycle
            if (subscription.cycle === 'monthly') {
              paymentDate.setMonth(paymentDate.getMonth() + i);
            } else if (subscription.cycle === 'yearly') {
              paymentDate.setFullYear(paymentDate.getFullYear() + i);
            } else if (subscription.cycle === 'quarterly') {
              paymentDate.setMonth(paymentDate.getMonth() + (i * 3));
            } else if (subscription.cycle === 'weekly') {
              paymentDate.setDate(paymentDate.getDate() + (i * 7));
            }
            
            return (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{formatDate(paymentDate)}</p>
                  <p className="text-sm text-gray-500">
                    {i === 0 ? 'Next payment' : `Payment ${i + 1}`}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(subscription.price)}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}