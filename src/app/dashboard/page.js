'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ravenlogo from '@/app/asset/svg/ravenlogo.svg';
import background from '@/app/asset/svg/ray-background.svg';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import StartMeetingModal from '@/components/StartMeetingModal';
import RealtimeTranscript from '@/components/RealtimeTranscript';
import ApiConfigModal from '@/components/ApiConfigModal';
import MeetingHistory from '@/components/MeetingHistory';
import { startMeetingBot, stopMeetingBot, getMeetingHistory } from '@/lib/vexa-api-service';

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  
  // Meeting management state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showApiConfigModal, setShowApiConfigModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };


  // Handle starting a new meeting
  const handleStartMeeting = async (meetingData) => {
    try {
      setError('');
      const result = await startMeetingBot(meetingData);
      
      // Set up active meeting state
      setActiveMeeting({
        id: result.meetingId,
        platform: meetingData.platform,
        description: meetingData.description,
        startTime: new Date().toISOString(),
        status: 'active'
      });
      
      setShowMeetingModal(false);
      
    } catch (err) {
      console.error('Failed to start meeting:', err);
      throw err; // Re-throw to be handled by the modal
    }
  };

  // Handle stopping the active meeting
  const handleStopMeeting = async () => {
    if (!activeMeeting) return;
    
    try {
      await stopMeetingBot(activeMeeting?.id);
      setActiveMeeting(null);
      
    } catch (err) {
      console.error('Failed to stop meeting:', err);
      setError('Failed to stop meeting: ' + err.message);
    }
  };

  // Handle transcript errors
  const handleTranscriptError = (err) => {
    console.error('Transcript error:', err);
    setError('Transcript error: ' + err.message);
  };

  const handleViewMeeting = (meetingId) => {
    // Set the meeting as active to view its transcript
    if (!meetingId || typeof meetingId !== 'string') {
      console.error('Invalid meetingId:', meetingId, 'Type:', typeof meetingId);
      return;
    }
    
    const parts = meetingId.split('/');
    const [platform, nativeId, meetingDbId] = parts;
    
    setActiveMeeting({ 
      id: `${platform}/${nativeId}`, // Use the format expected by the API
      platform: platform,
      nativeId: nativeId,
      meetingDbId: meetingDbId
    });
  };

  const handleResumeMeeting = (meetingId) => {
    // Resume an active meeting
    if (!meetingId || typeof meetingId !== 'string') {
      console.error('Invalid meetingId:', meetingId);
      return;
    }
    
    const parts = meetingId.split('/');
    const [platform, nativeId, meetingDbId] = parts;
    
    setActiveMeeting({ 
      id: `${platform}/${nativeId}`, // Use the format expected by the API
      platform: platform,
      nativeId: nativeId,
      meetingDbId: meetingDbId
    });
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
            {activeMeeting ? (
              /* Active Meeting View */
              <div className="h-full p-4 lg:p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Active Meeting Transcription
                  </h2>
                  <p className="text-zinc-400 text-sm">
                    {activeMeeting?.description || `Meeting on ${(activeMeeting?.platform || 'unknown').replace('_', ' ').toUpperCase()}`}
                  </p>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-900/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="h-[calc(100vh-16rem)]">
                  <RealtimeTranscript
                    meetingId={activeMeeting?.id}
                    onStop={handleStopMeeting}
                    onError={handleTranscriptError}
                  />
                </div>
              </div>
            ) : (
              /* Dashboard Home View */
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

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-900/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
                {/* Start New Meeting */}
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <h3 className="text-lg font-semibold text-white mb-3">Start New Meeting</h3>
                  <p className="text-zinc-400 mb-4 text-sm leading-relaxed">
                    Begin transcribing your next meeting with AI-powered note-taking.
                  </p>
                  <button 
                    onClick={() => setShowMeetingModal(true)}
                    className="w-full py-3 px-4 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-colors text-sm"
                  >
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
                  <button 
                    onClick={() => setShowApiConfigModal(true)}
                    className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    Open Settings
                  </button>
                </div>
              </div>

              {/* Meeting History */}
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-zinc-800">
                <MeetingHistory 
                  onViewMeeting={handleViewMeeting}
                  onResumeMeeting={handleResumeMeeting}
                />
              </div>
            </div>
            )}
          </main>
        </SidebarInset>
        
        {/* Meeting Modal */}
        <StartMeetingModal
          isOpen={showMeetingModal}
          onClose={() => setShowMeetingModal(false)}
          onStartMeeting={handleStartMeeting}
        />
        
        {/* API Configuration Modal */}
        <ApiConfigModal
          isOpen={showApiConfigModal}
          onClose={() => setShowApiConfigModal(false)}
        />
        
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
