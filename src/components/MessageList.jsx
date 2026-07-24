import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const suggestions = [
  'Explain quantum computing',
  'Write a React component',
  'Debug this code',
  'Plan a trip to Japan',
];

export default function MessageList({ messages, isStreaming, onAnswerQuiz }) {
  const messagesEndRef = useRef(null);
  const endRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-accent-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-slate-100 text-xl font-medium mb-1">Start a conversation</h2>
        <p className="text-slate-500 text-sm max-w-xs">Ask me anything — I'm here to help with questions, coding, writing, analysis, and more.</p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {suggestions.map((s, i) => (
            <button key={i} className="suggestion-chip">{s}</button>
          ))}
        </div>
        <div ref={endRef} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message, index) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isLast={index === messages.length - 1}
          onAnswerQuiz={onAnswerQuiz}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
