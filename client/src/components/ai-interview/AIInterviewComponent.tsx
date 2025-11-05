/**
 * AI Interview Component
 * Demonstrates complete WebSocket-based AI Interview flow
 */

'use client';

import React, { useState } from 'react';
import { useAIInterviewWebSocket, WSQuestionMessage, WSCompletionMessage } from '@/hooks/useAIInterviewWebSocket';

interface AIInterviewProps {
  interviewId: string;
}

/**
 * Validates that a URL is from a trusted source (Google Cloud Storage)
 * @param url - The URL to validate
 * @returns true if URL is from a trusted source, false otherwise
 */
function isTrustedUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Allow only HTTPS URLs from googleapis.com (Google Cloud Storage)
    return urlObj.protocol === 'https:' && urlObj.hostname.endsWith('googleapis.com');
  } catch {
    return false;
  }
}

export function AIInterviewComponent({ interviewId }: AIInterviewProps) {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [completionData, setCompletionData] = useState<WSCompletionMessage | null>(null);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);

  const {
    isConnected,
    currentQuestion,
    sendTextAnswer,
    disconnect,
  } = useAIInterviewWebSocket({
    interviewId,
    onQuestion: (message: WSQuestionMessage) => {
      console.log('New question received:', message);
      setCurrentAnswer(''); // Clear previous answer
    },
    onStatus: (message) => {
      console.log('Status update:', message.status);
      setStatusMessages((prev) => [...prev, message.status]);
    },
    onError: (message) => {
      console.error('Error:', message.error);
      alert(`Error: ${message.error}`);
    },
    onCompletion: (message: WSCompletionMessage) => {
      console.log('Interview completed:', message);
      setInterviewComplete(true);
      setCompletionData(message);
    },
    onTranscription: (message) => {
      console.log('Audio transcription:', message.transcription);
      // You could display this to the user
    },
    onConnect: () => {
      console.log('Connected to interview session');
    },
    onDisconnect: () => {
      console.log('Disconnected from interview session');
    },
  });

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !currentAnswer.trim()) {
      alert('Please provide an answer');
      return;
    }

    const success = sendTextAnswer(currentAnswer, currentQuestion.question_index);
    if (success) {
      console.log('Answer submitted');
    } else {
      alert('Failed to submit answer. Please check connection.');
    }
  };

  const handleEndInterview = () => {
    if (confirm('Are you sure you want to end the interview?')) {
      disconnect();
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to interview session...</p>
        </div>
      </div>
    );
  }

  if (interviewComplete && completionData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-8">
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Interview Completed!</h2>
          <p className="text-gray-600 mb-6">{completionData.message}</p>
          
          {completionData.overall_score && (
            <div className="mb-6">
              <p className="text-lg text-gray-700">Your Score:</p>
              <p className="text-4xl font-bold text-blue-600">{completionData.overall_score}/100</p>
            </div>
          )}
          
          {completionData.report_url && isTrustedUrl(completionData.report_url) && (
            <a
              href={completionData.report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Download Interview Report
            </a>
          )}
          
          {completionData.report_url && !isTrustedUrl(completionData.report_url) && (
            <p className="text-red-600 text-sm">
              Report URL is not from a trusted source and cannot be displayed.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">AI Interview</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestion ? currentQuestion.question_index + 1 : 0} of {currentQuestion?.total_questions || 0}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessages.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{statusMessages[statusMessages.length - 1]}</p>
        </div>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <div className="mb-6">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-2">
              {currentQuestion.question_type}
            </span>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Audio Player */}
          {currentQuestion.question_audio_url && isTrustedUrl(currentQuestion.question_audio_url) && (
            <div className="mb-4">
              <audio controls src={currentQuestion.question_audio_url} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Answer Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              placeholder="Type your answer here..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {currentAnswer.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim()}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
            >
              Submit Answer
            </button>
            <button
              onClick={handleEndInterview}
              className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              End Interview
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Instructions:</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Listen to or read each question carefully</li>
          <li>Provide detailed answers (minimum 10 words recommended)</li>
          <li>Click "Submit Answer" to move to the next question</li>
          <li>The interview will automatically end after all questions or 30 minutes</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Example Usage:
 * 
 * // First, initialize the interview via REST API
 * const initResponse = await fetch('/api/tenant/ai-interview/init', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     application_id: 'uuid',
 *     resume_blob_name: 'resumes/resume.pdf',
 *     jd_content: 'Job description text...',
 *     candidate_name: 'John Doe',
 *     position: 'Software Engineer',
 *     num_questions: 5
 *   })
 * });
 * 
 * const { interview_id } = await initResponse.json();
 * 
 * // Then render the component
 * <AIInterviewComponent interviewId={interview_id} />
 */
