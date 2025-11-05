# AI Interview WebSocket System

## Overview

This implementation provides a real-time AI interview system using WebSockets. The system allows candidates to participate in AI-conducted interviews with support for both text and audio responses.

## Architecture Decision

**Chosen Approach: Option 2** - Backend sends `interview_id` first, then the first question is sent via WebSocket after connection.

### Why Option 2?

1. **Cleaner Separation**: Initialization (REST) and interview flow (WebSocket) are clearly separated
2. **Flexibility**: Allows reconnection scenarios and better error handling
3. **Standard Pattern**: Follows WebSocket best practices
4. **Consistency**: All questions (including first) flow through the same channel

## System Flow

```
┌─────────┐                  ┌─────────┐                  ┌──────────┐
│ Client  │                  │ Backend │                  │  Gemini  │
└────┬────┘                  └────┬────┘                  └────┬─────┘
     │                            │                             │
     │ POST /init                 │                             │
     │ (resume, JD, details)      │                             │
     ├───────────────────────────>│                             │
     │                            │ Process Resume              │
     │                            │ Generate Questions          │
     │                            ├────────────────────────────>│
     │                            │<────────────────────────────┤
     │ interview_id, ws_url       │ (Gemini 2.5 Pro)            │
     │<───────────────────────────┤                             │
     │                            │                             │
     │ WebSocket Connect          │                             │
     ├───────────────────────────>│                             │
     │                            │                             │
     │ Status: Connected          │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │ Question 1 (text + audio)  │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │ Answer (text/audio)        │                             │
     ├───────────────────────────>│                             │
     │                            │ STT (if audio)              │
     │                            ├────────────────────────────>│
     │ Transcription              │<────────────────────────────┤
     │<───────────────────────────┤ (Gemini 2.5 Flash)          │
     │                            │                             │
     │                            │ Generate Follow-up?         │
     │                            ├────────────────────────────>│
     │                            │<────────────────────────────┤
     │ Status: Follow-up added    │ (Gemini 2.5 Pro)            │
     │<───────────────────────────┤                             │
     │                            │                             │
     │ Question 2 (text + audio)  │                             │
     │<───────────────────────────┤                             │
     │                            │                             │
     │      ... (loop) ...        │                             │
     │                            │                             │
     │ Completion + Report        │                             │
     │<───────────────────────────┤                             │
     └────────────────────────────┴─────────────────────────────┘
```

## Backend Implementation

### Endpoints

#### 1. Initialize Interview (REST)
```http
POST /api/tenant/ai-interview/init
Content-Type: application/json

{
  "application_id": "uuid",
  "resume_blob_name": "resumes/john_doe.pdf",
  "jd_content": "Software Engineer position...",
  "candidate_name": "John Doe",
  "position": "Software Engineer",
  "num_questions": 5
}
```

**Response:**
```json
{
  "interview_id": "interview_20251105_153000_john_doe_a1b2c3d4",
  "websocket_url": "/api/tenant/ai-interview/ws/interview_20251105_153000_john_doe_a1b2c3d4"
}
```

#### 2. WebSocket Interview Endpoint
```
WS /api/tenant/ai-interview/ws/{session_id}
```

### WebSocket Message Protocol

#### Client → Server Messages

**Text Answer:**
```json
{
  "type": "text_answer",
  "answer": "I have 5 years of experience...",
  "question_index": 0,
  "timestamp": "2025-11-05T15:30:00.000Z"
}
```

**Audio Answer:**
```json
{
  "type": "audio_answer",
  "audio_blob_name": "interview_audio/answer_1.mp3",
  "question_index": 0,
  "timestamp": "2025-11-05T15:30:00.000Z"
}
```

#### Server → Client Messages

**Status:**
```json
{
  "type": "status",
  "status": "Connected to interview session",
  "details": {"session_id": "interview_..."},
  "timestamp": "2025-11-05T15:30:00.000Z"
}
```

**Question:**
```json
{
  "type": "question",
  "question_index": 0,
  "question_text": "Tell me about your experience with Python.",
  "question_audio_url": "https://storage.googleapis.com/...",
  "total_questions": 5,
  "question_type": "technical",
  "timestamp": "2025-11-05T15:30:00.000Z"
}
```

**Transcription:**
```json
{
  "type": "transcription",
  "transcription": "I have five years of experience...",
  "timestamp": "2025-11-05T15:30:00.000Z"
}
```

**Completion:**
```json
{
  "type": "completion",
  "message": "Interview completed successfully",
  "report_url": "https://storage.googleapis.com/.../report.pdf",
  "overall_score": 85.5,
  "timestamp": "2025-11-05T16:00:00.000Z"
}
```

**Error:**
```json
{
  "type": "error",
  "error": "Session not found",
  "code": "SESSION_NOT_FOUND",
  "timestamp": "2025-11-05T15:30:00.000Z"
}
```

### Key Features

1. **30-Minute Timeout**: Interviews automatically terminate after 30 minutes
2. **Follow-up Questions**: System generates intelligent follow-ups based on answers
3. **Multi-format Support**: Text and audio responses supported
4. **Gemini Integration**:
   - **Gemini 2.5 Flash**: For fast speech-to-text conversion
   - **Gemini 2.5 Pro**: For complex question generation and follow-ups
5. **Real-time Feedback**: Status updates and transcriptions sent immediately

## Frontend Implementation

### Hook: `useAIInterviewWebSocket`

```typescript
const {
  isConnected,
  currentQuestion,
  sendTextAnswer,
  sendAudioAnswer,
  disconnect,
} = useAIInterviewWebSocket({
  interviewId: 'interview_...',
  onQuestion: (msg) => console.log('New question:', msg),
  onStatus: (msg) => console.log('Status:', msg.status),
  onError: (msg) => console.error('Error:', msg.error),
  onCompletion: (msg) => console.log('Score:', msg.overall_score),
  onTranscription: (msg) => console.log('Transcription:', msg.transcription),
});
```

### Component: `AIInterviewComponent`

A complete React component demonstrating the interview flow with:
- Connection status indicator
- Question display with audio playback
- Text input for answers
- Progress tracking
- Completion screen with score and report download

## Database Schema

### `ai_interviews` Table

```sql
CREATE TABLE ai_interviews (
    id UUID PRIMARY KEY,
    application_id UUID REFERENCES applications(id),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('INITIATED', 'IN_PROGRESS', 'COMPLETED', 'TIMEOUT', 'ERROR'),
    resume_blob_name VARCHAR(500) NOT NULL,
    jd_content TEXT NOT NULL,
    candidate_name VARCHAR(255),
    position VARCHAR(255),
    questions JSON,
    responses JSON,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    report_url VARCHAR(500),
    overall_score INTEGER
);
```

## Setup Instructions

### Backend

1. Ensure all dependencies are installed (FastAPI, websockets already included)
2. Run database migrations:
   ```bash
   cd server
   alembic upgrade head
   ```
3. Ensure Google Cloud credentials are configured for:
   - Storage (resume/audio upload)
   - Text-to-Speech
   - Speech-to-Text
   - Gemini API

### Frontend

1. Install dependencies (already in package.json)
2. Set environment variable:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Usage Example

```typescript
// 1. Initialize interview
const response = await fetch('/api/tenant/ai-interview/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    application_id: '123e4567-e89b-12d3-a456-426614174000',
    resume_blob_name: 'resumes/john_doe.pdf',
    jd_content: 'Software Engineer - 5+ years Python experience...',
    candidate_name: 'John Doe',
    position: 'Senior Software Engineer',
    num_questions: 5
  })
});

const { interview_id, websocket_url } = await response.json();

// 2. Render interview component
<AIInterviewComponent interviewId={interview_id} />
```

## Testing

Manual testing steps:
1. Call init endpoint with valid resume and JD
2. Connect to WebSocket using returned interview_id
3. Receive first question
4. Submit text answer
5. Receive next question or follow-up
6. Complete all questions
7. Receive completion message with report URL

## Security Considerations

- WebSocket connections should be authenticated (add auth middleware)
- Session IDs should be validated against user permissions
- File uploads should be validated and scanned
- Rate limiting should be applied to prevent abuse
- Timeout mechanism prevents resource exhaustion

## Future Enhancements

1. Add authentication middleware for WebSocket
2. Implement Redis for session storage (currently in-memory)
3. Add reconnection logic for network interruptions
4. Support video responses
5. Real-time interviewer notes/feedback
6. Multi-language support
7. Analytics and insights dashboard
