import { useRef, useEffect, useCallback } from 'react';

export default function MessageInput({ onSend, disabled, onStop, isStreaming }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  const handleChange = (e) => {
    adjustHeight();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const content = e.currentTarget.value.trim();
      if (content && !disabled) {
        onSend(content);
        e.currentTarget.value = '';
        adjustHeight();
      }
    }
  };

  return (
    <div className="input-area">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={isStreaming ? 'Generating response...' : 'Message AI... (Enter to send, Shift+Enter for new line)'}
            className="textarea"
            rows={1}
            spellCheck={false}
            autoFocus
          />
        </div>
        
        {isStreaming ? (
          <button
            onClick={onStop}
            className="send-btn bg-red-500/80 hover:bg-red-500"
            title="Stop generating"
            aria-label="Stop generating"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => {
              const textarea = textareaRef.current;
              if (textarea && textarea.value.trim() && !disabled) {
                onSend(textarea.value.trim());
                textarea.value = '';
                adjustHeight();
              }
            }}
            disabled={disabled}
            className="send-btn"
            title="Send message"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </div>
      
      <p className="text-xs text-slate-500 mt-2 text-center">
        Powered by OpenRouter &middot; Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
