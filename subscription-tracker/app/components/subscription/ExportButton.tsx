'use client';

import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { Subscription } from '@/app/utils/types';
import { exportSubscriptions } from '@/app/utils/exportData';
import Button from '../ui/Button';

interface ExportButtonProps {
  subscriptions: Subscription[];
  className?: string;
}

export default function ExportButton({ subscriptions, className = '' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'csv' | 'json') => {
    exportSubscriptions(subscriptions, format);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`flex items-center ${className}`}
      >
        <FiDownload className="mr-2" />
        Export
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => handleExport('csv')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              Export as CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              role="menuitem"
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}