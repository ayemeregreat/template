'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const EmailSubscription = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [language, setLanguage] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribeClick = async () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setStatusMessage(null);
      setStatusType(null);
      return;
    }

    if (!email.trim()) {
      setStatusMessage('Please enter a valid email address.');
      setStatusType('error');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Subscription failed.');
      }

      setStatusMessage('Subscription saved. Thank you!');
      setStatusType('success');
      setEmail('');
      setName('');
      setBirthdate('');
      setLanguage('');
      setIsExpanded(false);
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Subscription failed.',
      );
      setStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-6 px-2 sm:px-0">
        <h3 className="text-center text-xl text-balance font-semibold tracking-tight md:text-2xl lg:text-3xl mb-4">
          Help us personalize your newsletter
        </h3>
      </div>

      <div className="flex flex-row items-center gap-3 mb-4">
        <Input
          placeholder="Enter Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-0 h-12 text-base"
        />
        <Button
          onClick={handleSubscribeClick}
          size="lg"
          className="h-12 min-h-[3rem] text-base px-6"
          disabled={isSubmitting}
        >
          {isExpanded ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Subscribe'}
        </Button>
      </div>

      {statusMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-md text-sm ${
            statusType === 'success'
              ? 'bg-emerald-600/10 text-emerald-200 border border-emerald-500/20'
              : 'bg-rose-600/10 text-rose-200 border border-rose-500/20'
          }`}
          role="status"
        >
          {statusMessage}
        </div>
      )}

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Your birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
          <Input
            placeholder="e.g., English"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="md:col-span-2"
          />
        </div>
      )}
    </div>
  );
};

export default EmailSubscription;
