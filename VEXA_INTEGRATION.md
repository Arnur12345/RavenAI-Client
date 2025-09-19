# Vexa API Integration - RavenAI Meeting Transcription

This document outlines the implementation of the Vexa API integration for real-time meeting transcription in the RavenAI dashboard.

## Overview

The integration allows users to:
- Start transcription bots for Google Meet, Microsoft Teams, and Zoom meetings
- View real-time transcripts with speaker identification
- Manage active meetings and view meeting history
- Configure API settings through a user-friendly interface

## Architecture

### Core Components

1. **StartMeetingModal** (`/src/components/StartMeetingModal.jsx`)
   - Modal for starting new meeting transcriptions
   - URL validation and platform detection
   - Form fields: meeting URL, platform, description, bot name, language

2. **RealtimeTranscript** (`/src/components/RealtimeTranscript.jsx`)
   - Real-time transcript display with WebSocket support
   - Fallback to polling if WebSocket fails
   - Meeting controls (stop, language change, settings)
   - Speaker identification and timestamp display

3. **ApiConfigModal** (`/src/components/ApiConfigModal.jsx`)
   - Configuration interface for Vexa API settings
   - Local storage for API key and base URL
   - Environment variable support

### Services

1. **vexa-api-service.js** (`/src/lib/vexa-api-service.js`)
   - Core integration with Vexa API endpoints
   - Functions for bot management, transcript retrieval, meeting history
   - Error handling and response parsing

2. **meeting-websocket-service.js** (`/src/lib/meeting-websocket-service.js`)
   - WebSocket service for real-time transcript updates
   - Automatic reconnection and connection management
   - Event-driven architecture for transcript updates

## API Endpoints Used

Based on the Vexa API guide, the following endpoints are implemented:

### Bot Management
- `POST /bots` - Start a transcription bot for a meeting
- `DELETE /bots/{platform}/{native_meeting_id}` - Stop an active bot
- `GET /bots/status` - Get status of running bots
- `PUT /bots/{platform}/{native_meeting_id}/config` - Update bot configuration

### Transcripts
- `GET /transcripts/{platform}/{native_meeting_id}` - Get real-time meeting transcript

### Meetings
- `GET /meetings` - List meeting history
- `PATCH /meetings/{platform}/{native_meeting_id}` - Update meeting metadata

## Configuration

### Environment Variables

Set these in your `.env.local` file:

```bash
# Vexa API Configuration
NEXT_PUBLIC_VEXA_API_URL=https://api.cloud.vexa.ai
NEXT_PUBLIC_VEXA_API_KEY=your_api_key_here

# Optional: WebSocket URL (defaults to wss://api.cloud.vexa.ai/ws)
NEXT_PUBLIC_VEXA_WS_URL=wss://api.cloud.vexa.ai/ws
```

### Runtime Configuration

Users can also configure API settings through the dashboard:
1. Click "Settings" in the dashboard
2. Enter API Key and Base URL
3. Settings are stored in browser localStorage

## Features

### Meeting Start Flow
1. User clicks "Start Meeting" in dashboard
2. Modal opens with form fields
3. URL validation and platform auto-detection
4. API call to `/bots` endpoint
5. Real-time transcript view with WebSocket connection

### Real-time Updates
- **Default**: Polling every 3 seconds for reliable updates
- **Optional**: WebSocket connection for live updates (experimental)
- Connection status indicator (Live/Connecting/Polling)
- User can toggle between WebSocket and polling in settings

### Meeting Management
- Active meeting state tracking
- Meeting history display
- Stop meeting functionality
- Error handling and user feedback

### Transcript Features
- Speaker identification with color coding
- Timestamp display
- Auto-scroll to latest segments
- Language configuration
- Participant count tracking

## Error Handling

### API Errors
- 409 Conflict: Bot already running for meeting
- 401 Unauthorized: Invalid API key
- 429 Rate Limit: Too many requests
- Generic error handling with user-friendly messages

### WebSocket Errors
- Automatic fallback to polling
- Connection status indicators
- Reconnection attempts with exponential backoff
- Detailed error logging with connection state information
- Graceful degradation when WebSocket is unavailable

### Meeting URL Validation
- Platform detection (Google Meet, Teams, Zoom)
- URL format validation
- Clear error messages for unsupported platforms

## Platform Support

### Google Meet
- URL Pattern: `https://meet.google.com/xxx-xxxx-xxx`
- Platform ID: `google_meet`
- Full support implemented

### Microsoft Teams
- URL Pattern: `https://teams.microsoft.com/...`
- Platform ID: `microsoft_teams`
- Ready for implementation (UI support added)

### Zoom
- URL Pattern: `https://zoom.us/j/...`
- Platform ID: `zoom`
- Ready for implementation (UI support added)

## Usage Instructions

### For Users

1. **Configure API Settings**
   - Go to Dashboard → Settings
   - Enter your Vexa API key and URL
   - Save configuration

2. **Start a Meeting**
   - Click "Start Meeting" in dashboard
   - Enter meeting URL (Google Meet supported)
   - Optionally set description and bot name
   - Click "Start Meeting"

3. **View Transcripts**
   - Real-time transcript appears automatically
   - See speaker names, timestamps, and text
   - Connection status shown in header
   - Use settings to change language

4. **Stop Meeting**
   - Click "Stop" button in transcript view
   - Bot will leave meeting and save transcript

### For Developers

1. **Adding New Platforms**
   - Update URL patterns in `StartMeetingModal.jsx`
   - Add parsing logic in `utils.js` `parseMeetingUrl` function
   - Test with platform-specific meeting URLs

2. **Extending WebSocket Events**
   - Add new event types in `meeting-websocket-service.js`
   - Handle events in `RealtimeTranscript.jsx`
   - Update event handlers as needed

3. **Customizing UI**
   - Modify components in `/src/components/`
   - Update styling in Tailwind classes
   - Add new features to dashboard

## Security Considerations

- API keys stored in localStorage (client-side only)
- Environment variables for production deployment
- WebSocket authentication via API key parameter
- No sensitive data logged to console

## Performance

- WebSocket preferred for real-time updates (lower latency)
- Polling fallback ensures reliability
- Efficient state management with React hooks
- Segment deduplication to prevent duplicates

## Troubleshooting

### Common Issues

1. **"No API key found"**
   - Configure API key in Settings or environment variables

2. **"WebSocket connection error"**
   - Check API key validity
   - Verify WebSocket URL configuration
   - System will fallback to polling automatically

3. **"Failed to parse meeting URL"**
   - Ensure URL is from supported platform
   - Check URL format matches expected pattern

4. **"Bot already running for this meeting"**
   - Stop existing bot first or wait for it to end
   - Check running bots status in API

### Debug Mode

Enable detailed logging by opening browser developer tools. The application logs:
- API requests and responses
- WebSocket connection events
- Meeting state changes
- Error details

## Future Enhancements

1. **Additional Platforms**
   - Complete Microsoft Teams integration
   - Add Zoom support
   - Support for other video platforms

2. **Advanced Features**
   - Meeting notes and summaries
   - Export transcripts (PDF, Word, etc.)
   - Integration with calendar systems
   - Custom vocabulary and language models

3. **Performance Optimizations**
   - Transcript segment virtualization for long meetings
   - Caching strategies for meeting history
   - Optimistic UI updates

4. **Collaboration Features**
   - Shared meeting access
   - Real-time collaboration on notes
   - Meeting participant management
