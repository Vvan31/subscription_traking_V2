'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserSubscriptions, deleteSubscription } from '@/app/services/subscriptions';
import { Subscription } from '@/app/utils/types';
import { useAuth } from '@/app/hooks/useAuth';
import Button from '@/app/components/ui/Button';
import SubscriptionCard from '@/app/components/subscription/SubscriptionCard';
import ExportButton from '@/app/components/subscription/ExportButton';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Card from '@/app/components/ui/Card';



export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    async function loadSubscriptions() {
      if (!user) return;
      
      try {
        const data = await getUserSubscriptions(user.uid);
        setSubscriptions(data);
      } catch (err) {
        console.error('Error loading subscriptions:', err);
        setError('Failed to load subscriptions');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadSubscriptions();
    } else if (!loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    setIsDeleting(true);
    setDeletingId(id);
    
    try {
      await deleteSubscription(id);
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    } catch (err) {
      console.error('Error deleting subscription:', err);
      setError('Failed to delete subscription');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  // Format payment date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  // Get cycle display text
  const getCycleText = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      case 'quarterly': return 'Quarterly';
      case 'weekly': return 'Weekly';
      default: return cycle;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Subscriptions</h1>
        <div className="flex space-x-2">
          {subscriptions.length > 0 && (
            <ExportButton subscriptions={subscriptions} />
          )}
          <Link href="/subscriptions/add">
            <Button variant="primary" className="flex items-center">
              <FiPlus className="mr-2" />
              Add New
            </Button>
          </Link>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 mb-2">No subscriptions yet</h2>
          <p className="text-gray-500 mb-6">Start tracking your subscriptions by adding your first one.</p>
          <Link href="/subscriptions/add">
            <Button variant="primary" className="inline-flex items-center">
              <FiPlus className="mr-2" />
              Add Subscription
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="flex flex-col md:flex-row md:items-center justify-between p-4">
              <div className="flex items-center mb-4 md:mb-0">
                {subscription.logo ? (
                  <img 
                    src={subscription.logo} 
                    alt={subscription.name} 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-gray-500">
                      {subscription.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{subscription.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Category:</span> {subscription.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Cycle:</span> {getCycleText(subscription.cycle)}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Next Payment:</span> {formatDate(subscription.paymentDate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end space-x-2">
                <div className="text-xl font-bold text-blue-600">${subscription.price.toFixed(2)}</div>
                <div className="flex space-x-2">
                  <Link href={`/subscriptions/edit/${subscription.id}`}>
                    <Button variant="secondary" className="p-2">
                      <FiEdit2 />
                    </Button>
                  </Link>
                  {/* <Button 
                    variant="danger" 
                    className="p-2" 
                    onClick={() => handleDelete(subscription.id)}
                    disabled={deleteLoading === subscription.id}
                  >
                    {deleteLoading === subscription.id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    ) : (
                      <FiTrash2 />
                    )}
                  </Button> */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}