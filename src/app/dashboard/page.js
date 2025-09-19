'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ravenlogo from '@/app/asset/svg/ravenlogo.svg';
import background from '@/app/asset/svg/ray-background.svg';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Redirect to auth page if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen font-[family-name:var(--font-figtree)] bg-black text-white flex">
        <AppSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            <Image
              src={background}
              alt="background-image"
              className="w-full h-full object-cover opacity-30"
              fill
            />
          </div>
          
          {/* Header */}
          <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-zinc-800">
            <div className="flex items-center justify-between p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <Image
                  src={ravenlogo}
                  alt="RavenAI logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-white font-semibold text-lg hidden sm:inline">RavenAI</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-zinc-400 text-sm sm:text-base hidden md:inline">
                  Welcome, {user.name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 sm:px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8 max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
                  Welcome to RavenAI Dashboard
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed px-4">
                  Your AI-powered meeting transcription and note-taking platform is ready to transform your meetings into actionable tasks.
                </p>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
                {/* Start New Meeting */}
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">Start New Meeting</h3>
                  <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                    Begin transcribing your next meeting with AI-powered note-taking.
                  </p>
                  <button className="w-full py-3 px-4 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-colors text-sm">
                    Start Meeting
                  </button>
                </div>

                {/* View Past Meetings */}
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">View Past Meetings</h3>
                  <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                    Access transcripts and summaries from your previous meetings.
                  </p>
                  <button className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm">
                    View History
                  </button>
                </div>

                {/* Settings */}
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors sm:col-span-2 lg:col-span-1">
                  <h3 className="text-lg font-semibold text-white mb-3">Settings</h3>
                  <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                    Configure your preferences and API integrations.
                  </p>
                  <button className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm">
                    Open Settings
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-zinc-800">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-zinc-400 mb-2 text-base">No meetings yet</p>
                  <p className="text-sm text-zinc-500">
                    Start your first meeting to see transcription history here.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
