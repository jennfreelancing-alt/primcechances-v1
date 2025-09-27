
import React from 'react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';

const Subscription = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ProfileHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <SubscriptionManager />
      </main>
    </div>
  );
};

export default Subscription;
