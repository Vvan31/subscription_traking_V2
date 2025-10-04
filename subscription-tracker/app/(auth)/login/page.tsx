'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogle } from '@/app/services/auth';
import Button from '@/app/components/ui/Button';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await signInWithGoogle();
      if (user) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">SubTracker</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Track your subscriptions effortlessly
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              fullWidth
              className="flex items-center justify-center gap-3"
            >
              <FcGoogle className="h-5 w-5" />
              <span>Sign in with Google</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}