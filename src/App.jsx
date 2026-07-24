import { useState, useCallback, useMemo } from 'react';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import ChatHeader from './components/ChatHeader';
import { useChat } from './hooks/useChat';
import { INITIAL_MODEL, AVAILABLE_MODELS, MODES, DIFFICULTIES } from './utils/constants';

function App() {
  const [model, setModel] = useState(INITIAL_MODEL);
  const [mode, setMode] = useState('chat');
  const [difficulty, setDifficulty] = useState('medium');
  const [topic, setTopic] = useState('');
  const [error, setError] = useState(null);
  const { messages, isStreaming, sendMessage, clearChat, abortStream, submitQuizAnswer } = useChat(model, setError);

  const handleSend = useCallback(async (content) => {
    setError(null);
    await sendMessage(content, mode, difficulty, topic);
  }, [sendMessage, mode, difficulty, topic]);

  const handleAnswerQuiz = useCallback(async (action, userAnswer, correctAnswer, explanation) => {
    if (action === 'next' && mode === 'quiz') {
      await sendMessage('Next question please', mode, difficulty, topic);
    } else if (action !== 'next' && userAnswer && correctAnswer) {
      // User clicked an option button - update quiz state
      submitQuizAnswer(userAnswer, correctAnswer, explanation);
    }
  }, [sendMessage, submitQuizAnswer, mode, difficulty, topic]);

  const handleClear = useCallback(() => {
    setError(null);
    clearChat();
  }, [clearChat]);

  const handleStop = useCallback(() => {
    abortStream();
  }, [abortStream]);

  const currentMode = useMemo(() => MODES.find(m => m.id === mode), [mode]);
  const currentDifficulty = useMemo(() => DIFFICULTIES.find(d => d.id === difficulty), [difficulty]);

  const showTopicInput = mode === 'learn' || mode === 'quiz';

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-dark-bg">
      <ChatHeader 
        model={model} 
        onModelChange={setModel} 
        onClear={handleClear}
        models={AVAILABLE_MODELS}
        mode={mode}
        onModeChange={setMode}
        modes={MODES}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        difficulties={DIFFICULTIES}
        topic={topic}
        onTopicChange={setTopic}
        showTopicInput={showTopicInput}
        disabled={isStreaming}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList 
          messages={messages} 
          isStreaming={isStreaming}
          onAnswerQuiz={handleAnswerQuiz}
        />
        
        {error && (
          <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 text-sm mx-4 mb-2 rounded-lg flex items-center justify-between animate-slide-up">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">✕</button>
          </div>
        )}
        
        <MessageInput
          onSend={handleSend}
          disabled={isStreaming}
          onStop={handleStop}
          isStreaming={isStreaming}
          placeholder={mode === 'quiz' ? 'Type your answer (A/B/C/D) or ask for next question...' : 'Message AI... (Enter to send, Shift+Enter for new line)'}
        />
      </div>
    </div>
  );
}

export default App;