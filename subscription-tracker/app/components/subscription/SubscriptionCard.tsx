import React from 'react';
import Link from 'next/link';
import { FiEdit2, FiTrash2, FiInfo } from 'react-icons/fi';
import { Subscription } from '@/app/utils/types';
import Card from '../ui/Card';

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  deletingId: string | null;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onDelete,
  isDeleting,
  deletingId
}) => {
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

  const getCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return '/month';
      case 'yearly': return '/year';
      case 'quarterly': return '/quarter';
      case 'weekly': return '/week';
      default: return '';
    }
  };

  const isBeingDeleted = isDeleting && deletingId === subscription.id;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium text-lg">{subscription.name}</h3>
          <div className="flex items-center mt-1">
            <span className="font-semibold text-lg">
              {formatCurrency(subscription.price)}
            </span>
            <span className="text-gray-500 text-sm ml-1">
              {getCycleLabel(subscription.cycle)}
            </span>
          </div>
          <div className="mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {subscription.category}
            </span>
            <span className="text-gray-500 text-sm ml-2">
              Next payment: {formatDate(subscription.paymentDate)}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <Link href={`/subscriptions/${subscription.id}`} className="p-2 text-gray-500 hover:text-blue-500">
            <FiInfo size={18} />
          </Link>
          <Link href={`/subscriptions/${subscription.id}/edit`} className="p-2 text-gray-500 hover:text-blue-500">
            <FiEdit2 size={18} />
          </Link>
          <button 
            onClick={() => onDelete(subscription.id || '')}
            disabled={isDeleting}
            className="p-2 text-gray-500 hover:text-red-500 disabled:opacity-50"
          >
            {isBeingDeleted ? (
              <div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent"></div>
            ) : (
              <FiTrash2 size={18} />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionCard;