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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


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

      // Handle redirect response from demo route
      if (response.redirected) {
        // The demo route redirected us to NextAuth signin, follow the redirect
        window.location.href = response.url;
      } else if (response.ok) {
        // Fallback: if no redirect, try to parse JSON response
        try {
          const result = await response.json();
          if (result.ok) {
            window.location.href = result.redirectUrl || callbackUrl;
          } else {
            setError(result.error || 'Demo login failed');
          }
        } catch {
          // If we can't parse JSON, assume success and redirect
          window.location.href = callbackUrl;
        }
      } else {
        // Handle error response
        try {
          const result = await response.json();
          setError(result.error || 'Demo login failed');
        } catch {
          setError('Demo login failed');
        }
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
        redirect: false,
        callbackUrl,
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        // Handle specific NextAuth error messages
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        // Successful login - redirect to dashboard
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError('An error occurred during sign in');
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

        {(error || errorParam) && (
          <div className="p-3 rounded-md bg-[var(--tint-error)] border border-[var(--error)] text-[var(--error)] text-sm">
            {errorParam === 'AccessDenied' ? 'Not whitelisted for staging' : 
             errorParam === 'CredentialsSignin' ? 'Invalid email or password' :
             errorParam ? errorParam : error}
          </div>
        )}

        <Button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
          disabled={isLoading}
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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {true && (
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
