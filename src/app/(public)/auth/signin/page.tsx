'use client';

import { useState, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getBoolean } from '@/lib/clientEnv';

function SignInForm() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/en/dashboard";
  const errorParam = sp.get("error");
  const reasonParam = sp.get("reason");
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteOk, setInviteOk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [inviteError, setInviteError] = useState('');

  // Check for existing invite verification on mount
  useEffect(() => {
    // Check localStorage first
    const localInviteOk = localStorage.getItem('invite_ok') === '1';
    
    // Check cookie as fallback
    const cookieInviteOk = document.cookie.includes('invite_ok=1');
    
    if (localInviteOk || cookieInviteOk) {
      setInviteOk(true);
    }
  }, []);

  const handleInviteVerify = async () => {
    if (!inviteCode.trim()) {
      setInviteError('Please enter an invite code');
      return;
    }

    setIsVerifying(true);
    setInviteError('');

    try {
      const response = await fetch('/api/invite/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });

      const result = await response.json();

      if (result.ok) {
        setInviteOk(true);
        localStorage.setItem('invite_ok', '1');
        setInviteCode(''); // Clear the input
      } else {
        setInviteError('Invalid invite code');
      }
    } catch (err) {
      setInviteError('Failed to verify invite code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.ok) {
        window.location.href = callbackUrl;
      } else {
        setError('Demo login failed');
      }
    } catch (err) {
      setError('An error occurred during demo login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        inviteCode: invite,
        callbackUrl,
        redirect: false,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        setError('Invalid credentials');
      } else if (result?.ok) {
        // Successful login - redirect to dashboard
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/en/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--text)]">Sign in</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-2">
            Welcome back to your workspace
          </p>
        </div>

        {(error || errorParam === 'AccessDenied') && (
          <div className="p-3 rounded-md bg-[var(--tint-error)] border border-[var(--error)] text-[var(--error)] text-sm">
            {errorParam === 'AccessDenied' ? 'Not whitelisted for staging' : error}
          </div>
        )}

        {!inviteOk && (
          <div className="space-y-3">
            {reasonParam === 'invite' && (
              <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                Staging access requires an invite code. Please enter your code to continue.
              </div>
            )}
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-[var(--text)] mb-1">
                Invite Code
              </label>
              <div className="flex gap-2">
                <Input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter invite code"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleInviteVerify()}
                />
                <Button
                  onClick={handleInviteVerify}
                  disabled={isVerifying || !inviteCode.trim()}
                  className="px-4"
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>
            {inviteError && (
              <div className="p-2 rounded-md bg-[var(--tint-error)] border border-[var(--error)] text-[var(--error)] text-sm">
                {inviteError}
              </div>
            )}
          </div>
        )}

        {inviteOk && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
            ✓ Invite code verified
          </div>
        )}

        <Button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
          disabled={isLoading || !inviteOk}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--card)] px-2 text-[var(--muted-fg)]">or</span>
          </div>
        </div>

        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="invite" className="block text-sm font-medium text-[var(--text)] mb-1">
              Invite Code <span className="text-[var(--muted-fg)]">(optional)</span>
            </label>
            <Input
              id="invite"
              type="text"
              value={invite}
              onChange={(e) => setInvite(e.target.value)}
              placeholder="Enter invite code"
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !inviteOk}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {getBoolean('NEXT_PUBLIC_ENABLE_DEMO_AUTH') && (
          <div className="text-center space-y-2">
            <p className="text-xs text-[var(--muted-fg)]">
              Try demo: creator@demo.local / any password
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full"
            >
              Quick Demo Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
