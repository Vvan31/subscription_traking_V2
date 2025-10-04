import React, { useState } from 'react';
import Button from '../ui/Button';
import { Subscription } from '@/app/utils/types';

interface SubscriptionFormProps {
  initialData?: Partial<Subscription>;
  onSubmit: (data: Partial<Subscription>) => void;
  isLoading: boolean;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    price: initialData.price?.toString() || '',
    cycle: initialData.cycle || 'monthly',
    category: initialData.category || '',
    paymentDate: initialData.paymentDate 
      ? new Date(initialData.paymentDate).toISOString().split('T')[0] 
      : '',
    notes: initialData.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        paymentDate: new Date(formData.paymentDate),
      });
    }
  };

  const categories = [
    'Entertainment',
    'Productivity',
    'Utilities',
    'Health & Fitness',
    'Education',
    'Food & Drink',
    'Shopping',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Subscription Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : ''
          }`}
          placeholder="Netflix, Spotify, etc."
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
              errors.price ? 'border-red-500' : ''
            }`}
            placeholder="0.00"
            aria-describedby="price-currency"
          />
        </div>
        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
      </div>

      <div>
        <label htmlFor="cycle" className="block text-sm font-medium text-gray-700">
          Billing Cycle
        </label>
        <select
          id="cycle"
          name="cycle"
          value={formData.cycle}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="quarterly">Quarterly</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.category ? 'border-red-500' : ''
          }`}
        >
          <option value="" disabled>Select a category</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
          Payment Date
        </label>
        <input
          type="date"
          id="paymentDate"
          name="paymentDate"
          value={formData.paymentDate}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.paymentDate ? 'border-red-500' : ''
          }`}
        />
        {errors.paymentDate && <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Any additional information about this subscription"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
              Saving...
            </>
          ) : (
            'Save Subscription'
          )}
        </Button>
      </div>
    </form>
  );
};

export default SubscriptionForm;