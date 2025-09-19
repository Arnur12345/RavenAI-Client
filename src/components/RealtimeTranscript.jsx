'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import { getMeetingTranscript, updateBotConfig } from '@/lib/vexa-api-service';
import { getMeetingWebSocketService, closeMeetingWebSocketService } from '@/lib/meeting-websocket-service';
import MeetingHeader from '@/components/meeting/MeetingHeader';
import MeetingControls from '@/components/meeting/MeetingControls';
import TranscriptSegment from '@/components/meeting/TranscriptSegment';
import TranscriptSearch from '@/components/meeting/TranscriptSearch';
import TranscriptSidebar from '@/components/meeting/TranscriptSidebar';

const RealtimeTranscript = ({ meetingId, onStop, onError }) => {
  const [segments, setSegments] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [language, setLanguage] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [useWebSocket, setUseWebSocket] = useState(false); // Start with polling by default
  const [query, setQuery] = useState('');
  const scrollRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const wsServiceRef = useRef(null);

  const languages = [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' }
  ];

  // Auto-scroll to bottom when new segments are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

  // WebSocket setup for real-time updates
  useEffect(() => {
    if (!meetingId || !isActive || !useWebSocket) {
      return;
    }

    const setupWebSocket = async () => {
      try {
        const wsService = getMeetingWebSocketService(meetingId);
        wsServiceRef.current = wsService;

        // Set up event handlers
        wsService.setOnTranscriptUpdate((newSegments) => {
          setSegments(prevSegments => {
            // Create a map of existing segments by ID to avoid duplicates
            const existingSegmentIds = new Set(prevSegments.map(s => s.id));
            const filteredNewSegments = newSegments.filter(s => !existingSegmentIds.has(s.id));
            
            if (filteredNewSegments.length > 0) {
              return [...prevSegments, ...filteredNewSegments];
            }
            return prevSegments;
          });
        });

        wsService.setOnMeetingStatus((status) => {
          console.log('Meeting status update:', status);
          if (status === 'stopped' || status === 'ended') {
            setIsActive(false);
          }
        });

        wsService.setOnError((err) => {
          console.error('WebSocket error:', err);
          setError('WebSocket connection error: ' + err.message);
          setWsConnected(false);
          // Fallback to polling on WebSocket error
          setUseWebSocket(false);
          // Call the parent error handler
          if (onError) {
            onError(err);
          }
        });

        wsService.setOnConnected(() => {
          console.log('WebSocket connected for meeting:', meetingId);
          setWsConnected(true);
          setError('');
        });

        wsService.setOnDisconnected(() => {
          console.log('WebSocket disconnected for meeting:', meetingId);
          setWsConnected(false);
        });

        // Connect to WebSocket
        await wsService.connect();

      } catch (err) {
        console.error('Failed to setup WebSocket:', err);
        setError('Failed to connect to real-time updates: ' + err.message);
        setUseWebSocket(false); // Fallback to polling
        setWsConnected(false);
        // Call the parent error handler
        if (onError) {
          onError(err);
        }
      }
    };

    setupWebSocket();

    return () => {
      if (wsServiceRef.current) {
        closeMeetingWebSocketService(meetingId);
        wsServiceRef.current = null;
      }
    };
  }, [meetingId, isActive, useWebSocket]);

  // Fallback polling when WebSocket is not used
  useEffect(() => {
    if (!meetingId || !isActive || useWebSocket) return;

    const fetchTranscript = async () => {
      try {
        setError('');
        const data = await getMeetingTranscript(meetingId);
        
        // Update segments only if we have new data
        if (data.segments && data.segments.length > 0) {
          setSegments(prevSegments => {
            // Create a map of existing segments by ID to avoid duplicates
            const existingSegmentIds = new Set(prevSegments.map(s => s.id));
            const newSegments = data.segments.filter(s => !existingSegmentIds.has(s.id));
            
            if (newSegments.length > 0) {
              return [...prevSegments, ...newSegments];
            }
            return prevSegments;
          });
        }
        
        if (data.language) {
          setLanguage(data.language);
        }
        
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setError(err.message);
        if (onError) {
          onError(err);
        }
      }
    };

    // Initial fetch
    fetchTranscript();

    // Set up polling for real-time updates
    pollIntervalRef.current = setInterval(fetchTranscript, 3000); // Poll every 3 seconds

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [meetingId, isActive, useWebSocket, onError]);

  // Initialize meeting info
  useEffect(() => {
    if (meetingId && !meetingInfo) {
      setMeetingInfo({
        platform: meetingId.split('/')[0],
        id: meetingId.split('/')[1]
      });
    }
  }, [meetingId, meetingInfo]);

  // Update participant count
  useEffect(() => {
    const uniqueSpeakers = new Set(segments.map(s => s.speaker).filter(s => s && s !== 'Unknown'));
    setParticipantCount(uniqueSpeakers.size);
  }, [segments]);

  const handleStop = async () => {
    setIsLoading(true);
    try {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      
      // Close WebSocket connection
      if (wsServiceRef.current) {
        closeMeetingWebSocketService(meetingId);
        wsServiceRef.current = null;
      }
      
      setIsActive(false);
      setWsConnected(false);
      await onStop();
    } catch (err) {
      setError('Failed to stop meeting: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    try {
      setIsLoading(true);
      await updateBotConfig(meetingId, { language: newLanguage });
      setLanguage(newLanguage);
      setShowSettings(false);
      setError('');
    } catch (err) {
      setError('Failed to update language: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAll = () => {
    try {
      const text = segments
        .map(s => `[${formatTimestamp(s.timestamp)}] ${(s.speaker || 'Unknown')}: ${s.text}`)
        .join('\n');
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch {}
  };

  const handleExport = () => {
    try {
      const text = segments
        .map(s => `[${formatTimestamp(s.timestamp)}] ${(s.speaker || 'Unknown')}: ${s.text}`)
        .join('\n');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${meetingInfo?.id || 'meeting'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  };

  const getSpeakerColor = (speaker) => {
    const colors = [
      'text-blue-400',
      'text-green-400',
      'text-purple-400',
      'text-yellow-400',
      'text-pink-400',
      'text-indigo-400',
      'text-red-400',
      'text-cyan-400'
    ];
    
    // Generate a consistent color based on speaker name
    let hash = 0;
    for (let i = 0; i < speaker.length; i++) {
      hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredSegments = query
    ? segments.filter(s => (s.text || '').toLowerCase().includes(query.toLowerCase()))
    : segments;

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 h-full flex flex-col">
      <MeetingHeader
        isActive={isActive}
        wsConnected={wsConnected}
        useWebSocket={useWebSocket}
        meetingInfo={meetingInfo}
        participantCount={participantCount}
        onToggleSettings={() => setShowSettings(!showSettings)}
        showSettings={showSettings}
        onStop={handleStop}
        isLoading={isLoading}
        onCopy={handleCopyAll}
        onExport={handleExport}
      />

      {showSettings && (
        <MeetingControls
          language={language}
          languages={languages}
          onLanguageChange={handleLanguageChange}
          isLoading={isLoading}
          useWebSocket={useWebSocket}
          setUseWebSocket={setUseWebSocket}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-900/30 rounded-lg">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 flex flex-col min-w-0">
          <TranscriptSearch query={query} setQuery={setQuery} />
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
          >
            {filteredSegments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-400 mb-2">
                  {isActive ? 'Waiting for speech...' : 'No transcript available'}
                </p>
                <p className="text-sm text-zinc-500">
                  {isActive 
                    ? 'The bot will begin transcribing once participants start speaking'
                    : 'The transcription session has ended'
                  }
                </p>
              </div>
            ) : (
              filteredSegments.map((segment, index) => (
                <TranscriptSegment
                  key={segment.id || index}
                  segment={segment}
                  getSpeakerColor={getSpeakerColor}
                  formatTimestamp={formatTimestamp}
                />
              ))
            )}
          </div>
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>
                {segments.length} segments • {participantCount} speakers
              </span>
              {isActive && (
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  Live
                </span>
              )}
            </div>
          </div>
        </div>
        <TranscriptSidebar
          meetingInfo={meetingInfo}
          participantCount={participantCount}
          wsConnected={wsConnected}
          useWebSocket={useWebSocket}
        />
      </div>
    </div>
  );
};

export default RealtimeTranscript;
