import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useState, useRef, useMemo } from 'react';
import QuizOption from './QuizOption';

const components = {
  code: ({ node, children, ...props }) => {
    const isInline = !node.children?.some(c => c.type === 'text' && c.value.includes('\n'));
    if (isInline) {
      return <code className="px-1.5 py-0.5 bg-slate-800/50 rounded text-slate-200 text-sm font-mono" {...props}>{children}</code>;
    }
    return <CodeBlock {...props}>{children}</CodeBlock>;
  },
  pre: ({ children, ...props }) => (
    <div className="code-block group" {...props}>{children}</div>
  ),
};

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const copyCode = async () => {
    try {
      const code = codeRef.current?.textContent || '';
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-mono">Code</span>
        <button
          onClick={copyCode}
          className="copy-btn px-2 py-1 text-xs rounded bg-slate-800/50 text-slate-400 hover:text-slate-100 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="m-0 p-0"><code ref={codeRef} className="text-sm text-slate-100">{children}</code></pre>
    </>
  );
}

function parseQuizContent(content) {
  const questionMatch = content.match(/\*\*Question:\*\*\s*([\s\S]*?)(?=\*\*Options:|\*\*Answer:|$)/);
  const optionsMatch = content.match(/\*\*Options:\*\*\s*([\s\S]*?)(?=\*\*Answer:|$)/);
  const answerMatch = content.match(/\*\*Answer:\*\*\s*([A-D])/i);
  const explanationMatch = content.match(/\*\*Explanation:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);

  if (!questionMatch && !optionsMatch) return null;

  const options = {};
  if (optionsMatch) {
    const optionLines = optionsMatch[1].split('\n');
    optionLines.forEach(line => {
      const match = line.match(/^([A-D])\)\s*(.+)$/i);
      if (match) {
        options[match[1].toUpperCase()] = match[2].trim();
      }
    });
  }

  return {
    question: questionMatch ? questionMatch[1].trim() : '',
    options,
    correctAnswer: answerMatch ? answerMatch[1].toUpperCase() : null,
    explanation: explanationMatch ? explanationMatch[1].trim() : '',
    rawContent: content
  };
}

export default function MessageBubble({ message, isLast, onAnswerQuiz }) {
  const isUser = message.role === 'user';
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const quizData = useMemo(() => {
    if (isUser) return null;
    return parseQuizContent(message.content);
  }, [message.content, isUser]);

  const handleOptionClick = (letter) => {
    if (showResult) return;
    setSelectedAnswer(letter);
    setShowResult(true);
    if (onAnswerQuiz && quizData) {
      onAnswerQuiz(letter, quizData.correctAnswer, quizData.explanation);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    if (onAnswerQuiz) {
      onAnswerQuiz('next', null, null);
    }
  };

  return (
    <div className={`flex flex-col gap-2 animate-slide-up w-full ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'} w-full`}>
        {!isUser && (
          <div className="message-header">
            <span className="flex items-center gap-1 text-slate-500">
              <svg className="w-3 h-3 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI Assistant
            </span>
            {message.isStreaming && (
              <span className="typing-indicator">
                <span className="typing-dot" style={{animationDelay: '0ms'}}></span>
                <span className="typing-dot" style={{animationDelay: '150ms'}}></span>
                <span className="typing-dot" style={{animationDelay: '300ms'}}></span>
              </span>
            )}
          </div>
        )}
        
        {quizData && !isUser ? (
          <div className="space-y-3">
            <div className="quiz-question bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <p className="font-medium text-slate-100">{quizData.question}</p>
            </div>
            
            <div className="quiz-options grid grid-cols-2 gap-2 sm:grid-cols-2">
              {['A', 'B', 'C', 'D'].map(letter => 
                quizData.options[letter] && (
                  <QuizOption
                    key={letter}
                    letter={letter}
                    text={quizData.options[letter]}
                    isSelected={selectedAnswer === letter}
                    isCorrect={quizData.correctAnswer === letter}
                    showResult={showResult}
                    onClick={() => handleOptionClick(letter)}
                    disabled={showResult}
                  />
                )
              )}
            </div>

            {showResult && quizData.explanation && (
              <div className={`quiz-explanation p-4 rounded-lg border-l-4 ${
                selectedAnswer === quizData.correctAnswer 
                  ? 'bg-green-500/10 border-green-500 text-green-300' 
                  : 'bg-red-500/10 border-red-500 text-red-300'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className={`w-5 h-5 ${selectedAnswer === quizData.correctAnswer ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {selectedAnswer === quizData.correctAnswer ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span className="font-medium">
                    {selectedAnswer === quizData.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{quizData.explanation}</p>
              </div>
            )}

            {showResult && (
              <button
                onClick={handleNextQuestion}
                className="w-full mt-2 bg-accent-primary hover:bg-accent-primary/80 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Next Question
              </button>
            )}
          </div>
        ) : (
          <div className="prose prose-invert prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown
              components={components}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              remarkPlugins={[remarkGfm]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}