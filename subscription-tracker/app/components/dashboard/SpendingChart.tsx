'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Subscription } from '@/app/utils/types';
import Card from '../ui/Card';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SpendingChartProps {
  subscriptions: Subscription[];
  type: 'bar' | 'doughnut';
  title: string;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ 
  subscriptions, 
  type,
  title
}) => {
  // Group subscriptions by category and calculate total spending per category
  const categoryData = subscriptions.reduce((acc, subscription) => {
    const { category, price, cycle } = subscription;
    
    // Convert all prices to monthly equivalent for consistency
    let monthlyPrice = price;
    if (cycle === 'yearly') {
      monthlyPrice = price / 12;
    } else if (cycle === 'quarterly') {
      monthlyPrice = price / 3;
    } else if (cycle === 'weekly') {
      monthlyPrice = price * 4.33; // Average weeks in a month
    }
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += monthlyPrice;
    return acc;
  }, {} as Record<string, number>);
  
  const categories = Object.keys(categoryData);
  const spendingValues = Object.values(categoryData);
  
  // Generate random colors for chart segments
  const generateColors = (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 137.5) % 360; // Use golden angle approximation for good distribution
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  };
  
  const backgroundColor = generateColors(categories.length);
  
  // Bar chart data
  const barData = {
    labels: categories,
    datasets: [
      {
        label: 'Monthly Spending ($)',
        data: spendingValues,
        backgroundColor,
        borderColor: backgroundColor.map(color => color.replace('60%', '50%')),
        borderWidth: 1,
      },
    ],
  };
  
  // Doughnut chart data
  const doughnutData = {
    labels: categories,
    datasets: [
      {
        data: spendingValues,
        backgroundColor,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };
  
  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value;
          }
        }
      }
    }
  };
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64">
        {type === 'bar' && (
          <Bar data={barData} options={barOptions} />
        )}
        {type === 'doughnut' && (
          <Doughnut data={doughnutData} options={doughnutOptions} />
        )}
      </div>
    </Card>
  );
};

export default SpendingChart;