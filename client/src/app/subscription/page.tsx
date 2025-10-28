"use client";

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { RequireSubscription } from '@/components/auth/ProtectedRoute';

export default function SubscriptionPage() {
  const { logout, accountStatus } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const handleContinueToSignup = () => {
    router.push('/signup');
  };

  return (
    <RequireSubscription>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Logo className="w-8" />
              <h1 className="text-xl font-semibold">Subscription Setup</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {accountStatus}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout} size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            
            <p className="text-gray-600 mb-8">
              You need to complete your subscription to access all WorkZone features. Continue with the signup process to select your plan.
            </p>
            
            <div className="space-y-4">
              <div className="p-6 bg-white rounded-xl border shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Complete Setup</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Finish your account setup by selecting a subscription plan that fits your organization's needs.
                </p>
                <Button onClick={handleContinueToSignup} className="w-full">
                  Continue to Plan Selection
                </Button>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">What You'll Get</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Complete HR management system</li>
                  <li>• Employee onboarding & management</li>
                  <li>• Leave & attendance tracking</li>
                  <li>• Performance analytics</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </RequireSubscription>
  );
}