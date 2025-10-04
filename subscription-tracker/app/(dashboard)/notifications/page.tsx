'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getUserNotificationPreferences, 
  addNotificationPreference, 
  updateNotificationPreference, 
  deleteNotificationPreference 
} from '@/app/services/notifications';
import { NotificationPreference } from '@/app/utils/types';
import { useAuth } from '@/app/hooks/useAuth';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import { FiSave, FiTrash2, FiPlus } from 'react-icons/fi';

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Form state for adding new preference
  const [newPreference, setNewPreference] = useState<Partial<NotificationPreference>>({
    type: 'email',
    daysInAdvance: 3,
    enabled: true
  });

  useEffect(() => {
    async function loadPreferences() {
      if (!user) return;
      
      try {
        const data = await getUserNotificationPreferences(user.uid);
        setPreferences(data);
      } catch (err) {
        console.error('Error loading notification preferences:', err);
        setError('Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadPreferences();
    } else if (!loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleAddPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const id = await addNotificationPreference(user.uid, {
        ...newPreference,
        userId: user.uid
      } as NotificationPreference);
      
      setPreferences([...preferences, { ...newPreference, id, userId: user.uid } as NotificationPreference]);
      setNewPreference({
        type: 'email',
        daysInAdvance: 3,
        enabled: true
      });
      setSuccess('Notification preference added successfully');
    } catch (err) {
      console.error('Error adding notification preference:', err);
      setError('Failed to add notification preference');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePreference = async (id: string, data: Partial<NotificationPreference>) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateNotificationPreference(id, data);
      
      setPreferences(preferences.map(pref => 
        pref.id === id ? { ...pref, ...data } as NotificationPreference : pref
      ));
      setSuccess('Notification preference updated successfully');
    } catch (err) {
      console.error('Error updating notification preference:', err);
      setError('Failed to update notification preference');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePreference = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification preference?')) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteNotificationPreference(id);
      setPreferences(preferences.filter(pref => pref.id !== id));
      setSuccess('Notification preference deleted successfully');
    } catch (err) {
      console.error('Error deleting notification preference:', err);
      setError('Failed to delete notification preference');
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

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Notification</h2>
        <form onSubmit={handleAddPreference} className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Notification Type
            </label>
            <select
              id="type"
              value={newPreference.type}
              onChange={(e) => setNewPreference({...newPreference, type: e.target.value as 'email' | 'push' | 'telegram'})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="push">Push Notification</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="daysInAdvance" className="block text-sm font-medium text-gray-700">
              Days in Advance
            </label>
            <input
              type="number"
              id="daysInAdvance"
              min="1"
              max="30"
              value={newPreference.daysInAdvance}
              onChange={(e) => setNewPreference({...newPreference, daysInAdvance: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={newPreference.enabled}
              onChange={(e) => setNewPreference({...newPreference, enabled: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
              Enable Notifications
            </label>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" /> Add Notification
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Your Notification Preferences</h2>
      
      {preferences.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500">No notification preferences set up yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {preferences.map((preference) => (
            <Card key={preference.id} className="relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium capitalize">{preference.type} Notification</h3>
                  <p className="text-gray-600">
                    {preference.daysInAdvance} {preference.daysInAdvance === 1 ? 'day' : 'days'} before payment
                  </p>
                  <div className="mt-2 flex items-center">
                    <input
                      type="checkbox"
                      id={`enabled-${preference.id}`}
                      checked={preference.enabled}
                      onChange={(e) => handleUpdatePreference(preference.id || '', { enabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`enabled-${preference.id}`} className="ml-2 block text-sm text-gray-900">
                      {preference.enabled ? 'Enabled' : 'Disabled'}
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeletePreference(preference.id || '')}
                    className="text-red-500 hover:text-red-700"
                    disabled={isSaving}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor={`days-${preference.id}`} className="block text-sm font-medium text-gray-700">
                  Days in Advance
                </label>
                <div className="flex items-center mt-1">
                  <input
                    type="number"
                    id={`days-${preference.id}`}
                    min="1"
                    max="30"
                    value={preference.daysInAdvance}
                    onChange={(e) => handleUpdatePreference(preference.id || '', { daysInAdvance: parseInt(e.target.value) })}
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    onClick={() => handleUpdatePreference(preference.id || '', { daysInAdvance: preference.daysInAdvance })}
                    className="ml-2 inline-flex items-center"
                    size="sm"
                    variant="outline"
                    disabled={isSaving}
                  >
                    <FiSave className="mr-1" size={14} /> Save
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}