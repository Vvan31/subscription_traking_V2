import { Subscription } from './types';

/**
 * Exports subscription data to CSV format
 * @param subscriptions Array of subscription objects
 * @returns CSV string
 */
export function exportToCSV(subscriptions: Subscription[]): string {
  // Define CSV headers
  const headers = [
    'Name',
    'Price',
    'Cycle',
    'Category',
    'Payment Date',
    'Notes',
    'Created At'
  ];
  
  // Create CSV content
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const sub of subscriptions) {
    const row = [
      `"${sub.name.replace(/"/g, '""')}"`,
      sub.price,
      sub.cycle,
      `"${sub.category.replace(/"/g, '""')}"`,
      new Date(sub.paymentDate).toISOString().split('T')[0],
      `"${(sub.notes || '').replace(/"/g, '""')}"`,
      new Date(sub.createdAt).toISOString()
    ];
    
    csvRows.push(row.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Exports subscription data to JSON format
 * @param subscriptions Array of subscription objects
 * @returns JSON string
 */
export function exportToJSON(subscriptions: Subscription[]): string {
  return JSON.stringify(subscriptions, null, 2);
}

/**
 * Triggers a download of the exported data
 * @param data The data to download
 * @param filename The name of the file
 * @param type The MIME type of the file
 */
export function downloadFile(data: string, filename: string, type: string): void {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Exports subscription data to a file
 * @param subscriptions Array of subscription objects
 * @param format The format to export to ('csv' or 'json')
 */
export function exportSubscriptions(subscriptions: Subscription[], format: 'csv' | 'json'): void {
  const date = new Date().toISOString().split('T')[0];
  let data: string;
  let filename: string;
  let type: string;
  
  if (format === 'csv') {
    data = exportToCSV(subscriptions);
    filename = `subscriptions_${date}.csv`;
    type = 'text/csv';
  } else {
    data = exportToJSON(subscriptions);
    filename = `subscriptions_${date}.json`;
    type = 'application/json';
  }
  
  downloadFile(data, filename, type);
}