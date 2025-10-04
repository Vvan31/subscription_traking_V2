'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserSubscriptions } from '@/app/services/subscriptions';
import { Subscription } from '@/app/utils/types';
import { useAuth } from '@/app/hooks/useAuth';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import SpendingChart from '@/app/components/dashboard/SpendingChart';
import { FiPlus } from 'react-icons/fi';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Calculate monthly spending
  const calculateMonthlySpending = () => {
    return subscriptions.reduce((total, subscription) => {
      let monthlyPrice = subscription.price;
      
      if (subscription.cycle === 'yearly') {
        monthlyPrice = subscription.price / 12;
      } else if (subscription.cycle === 'quarterly') {
        monthlyPrice = subscription.price / 3;
      } else if (subscription.cycle === 'weekly') {
        monthlyPrice = subscription.price * 4.33; // Average weeks in a month
      }
      
      return total + monthlyPrice;
    }, 0);
  };

  // Find upcoming payments (next 7 days)
  const getUpcomingPayments = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return subscriptions.filter(subscription => {
      const paymentDate = new Date(subscription.paymentDate);
      return paymentDate >= today && paymentDate <= nextWeek;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const monthlySpending = calculateMonthlySpending();
  const upcomingPayments = getUpcomingPayments();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/subscriptions/add">
            <Button className="flex items-center">
              <FiPlus className="mr-2" /> Add New Subscription
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <h2 className="text-sm font-medium text-gray-500">Monthly Spending</h2>
            <p className="text-2xl font-bold mt-1">{formatCurrency(monthlySpending)}</p>
          </Card>
          
          <Card className="p-4">
            <h2 className="text-sm font-medium text-gray-500">Active Subscriptions</h2>
            <p className="text-2xl font-bold mt-1">{subscriptions.length}</p>
          </Card>
          
          <Card className="p-4">
            <h2 className="text-sm font-medium text-gray-500">Upcoming Payments</h2>
            <p className="text-2xl font-bold mt-1">{upcomingPayments.length}</p>
          </Card>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-medium text-gray-900">No subscriptions yet</h2>
            <p className="mt-1 text-gray-500">Get started by adding your first subscription</p>
            <div className="mt-6">
              <Link href="/subscriptions/add">
                <Button className="flex items-center">
                  <FiPlus className="mr-2" /> Add New Subscription
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <SpendingChart 
                subscriptions={subscriptions} 
                type="doughnut" 
                title="Spending by Category" 
              />
              <SpendingChart 
                subscriptions={subscriptions} 
                type="bar" 
                title="Monthly Cost by Category" 
              />
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Payments</h2>
              {upcomingPayments.length === 0 ? (
                <Card className="p-4 text-center">
                  <p className="text-gray-500">No upcoming payments in the next 7 days</p>
                </Card>
              ) : (
                <Card className="p-4">
                  <ul className="divide-y divide-gray-200">
                    {upcomingPayments.map((subscription) => (
                      <li key={subscription.id} className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{subscription.name}</p>
                            <p className="text-sm text-gray-500">{formatDate(subscription.paymentDate)}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(subscription.price)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Recent Subscriptions</h2>
                <ul className="divide-y divide-gray-200">
                  {subscriptions.slice(0, 5).map((subscription) => (
                    <li key={subscription.id} className="py-3">
                      <Link href={`/subscriptions/${subscription.id}`} className="flex justify-between hover:bg-gray-50 -mx-4 px-4">
                        <p className="font-medium">{subscription.name}</p>
                        <p className="text-gray-600">{formatCurrency(subscription.price)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
                {subscriptions.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link href="/subscriptions" className="text-blue-500 hover:text-blue-700">
                      View all subscriptions
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
