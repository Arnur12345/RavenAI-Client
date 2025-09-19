'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ravenlogo from '@/app/asset/svg/ravenlogo.svg';
import background from '@/app/asset/svg/ray-background.svg';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signIn, signUp, loading, error, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      if (isLogin) {
        const result = await signIn(formData.email, formData.password);
        if (result.success) {
          setMessage('Successfully signed in! Redirecting...');
          router.push('/dashboard');
        } else {
          setMessage(result.error);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setMessage('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        const result = await signUp(formData.email, formData.fullName, formData.password);
        
        if (result.success) {
          setMessage('Account created successfully! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setMessage(result.error);
        }
      }
    } catch (err) {
      setMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
    setMessage('');
  };


  return (
    <div className="min-h-screen font-[family-name:var(--font-figtree)] bg-black text-white relative overflow-hidden">
      {/* Background */}
      <Image
        src={background}
        alt="background-image"
        className="absolute w-full h-full -left-[2rem] opacity-30"
      />
      
      {/* Header */}
      <div className="relative z-10 container mx-auto mt-[33px] mb-[50px] max-w-5xl">
        <div className="flex justify-between items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg">
              <Image
                src={ravenlogo}
                alt="RavenAI logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <span className="text-white font-semibold text-lg">RavenAI</span>
          </Link>
          <Link 
            href="/" 
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Auth Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[60vh] px-6">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src={ravenlogo}
                alt="RavenAI logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">
              {isLogin ? 'Welcome back' : 'Get started with RavenAI'}
            </h1>
            <p className="text-zinc-400">
              {isLogin 
                ? 'Sign in to your account to continue' 
                : 'Create your account to transform your meetings'
              }
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg text-sm ${
              message.includes('Successfully') || message.includes('Account created') 
                ? 'bg-green-900/50 text-green-300 border border-green-700' 
                : 'bg-red-900/50 text-red-300 border border-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-zinc-700 bg-zinc-900 text-white focus:ring-white/20"
                  />
                  <span className="ml-2 text-sm text-zinc-400">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || loading}
              className="w-full py-3 px-4 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isLoading || loading) ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-zinc-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 text-white hover:text-zinc-300 transition-colors font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
