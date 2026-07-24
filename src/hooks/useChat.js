import { useState, useCallback, useRef, useEffect } from 'react';
import { OPENROUTER_API_URL, SYSTEM_PROMPTS } from '../utils/constants';

export function useChat(model, setError) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [quizState, setQuizState] = useState({
    currentQuestion: null,
    selectedAnswer: null,
    showResult: false,
    score: { correct: 0, total: 0 }
  });
  const abortControllerRef = useRef(null);
  const messageIdRef = useRef(0);

  const generateId = useCallback(() => ++messageIdRef.current, []);

  const parseQuizQuestion = (content) => {
    const questionMatch = content.match(/\*\*Question:\*\*\s*([\s\S]*?)(?=\*\*Options:|\*\*Answer:|$)/);
    const optionsMatch = content.match(/\*\*Options:\*\*\s*([\s\S]*?)(?=\*\*Answer:|$)/);
    const answerMatch = content.match(/\*\*Answer:\*\*\s*([A-D])/);
    const explanationMatch = content.match(/\*\*Explanation:\*\*\s*([\s\S]*?)$/);

    if (questionMatch && optionsMatch && answerMatch) {
      const optionsText = optionsMatch[1].trim();
      const options = {};
      ['A', 'B', 'C', 'D'].forEach(letter => {
        const regex = new RegExp(`${letter}\\)\\s*([^\\n]+)`);
        const match = optionsText.match(regex);
        if (match) options[letter] = match[1].trim();
      });

      return {
        question: questionMatch[1].trim(),
        options,
        correctAnswer: answerMatch[1],
        explanation: explanationMatch ? explanationMatch[1].trim() : ''
      };
    }
    return null;
  };

  const sendMessage = useCallback(async (content, mode = 'chat', difficulty = 'medium', topic = '') => {
    if (!content.trim() || isStreaming) return;

    // Handle quiz answer submission
    if (mode === 'quiz' && quizState.currentQuestion && !quizState.showResult) {
      const userAnswer = content.trim().toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(userAnswer)) {
        setError('Please answer with A, B, C, or D');
        return;
      }

      const isCorrect = userAnswer === quizState.currentQuestion.correctAnswer;
      setQuizState(prev => ({
        ...prev,
        selectedAnswer: userAnswer,
        showResult: true,
        score: {
          correct: prev.score.correct + (isCorrect ? 1 : 0),
          total: prev.score.total + 1
        }
      }));

      // Send the answer to AI for next question
      const answerContent = `My answer: ${userAnswer}. ${isCorrect ? 'Correct!' : `Incorrect. The correct answer was ${quizState.currentQuestion.correctAnswer}.`} ${quizState.currentQuestion.explanation}. Please give me the next question.`;
      
      const userMessage = {
        id: generateId(),
        role: 'user',
        content: userAnswer,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsStreaming(true);

      const assistantMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
      abortControllerRef.current = new AbortController();

      const systemPrompt = SYSTEM_PROMPTS.quiz(topic, difficulty);

      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: answerContent },
            ],
            stream: true,
            temperature: 0.3,
            max_tokens: 4096,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.content;
                if (delta) {
                  accumulatedContent += delta;
                  setMessages(prev => prev.map(m => 
                    m.id === assistantMessage.id ? { ...m, content: accumulatedContent } : m
                  ));
                }
              } catch (e) {}
            }
          }
        }

        // Parse the new question from the response
        const newQuestion = parseQuizQuestion(accumulatedContent);
        if (newQuestion) {
          setQuizState(prev => ({ ...prev, currentQuestion: newQuestion, selectedAnswer: null, showResult: false }));
        }

        setMessages(prev => prev.map(m => 
          m.id === assistantMessage.id ? { ...m, content: accumulatedContent, isStreaming: false } : m
        ));

      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to send message');
          setMessages(prev => prev.filter(m => m.id !== assistantMessage.id));
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
      return;
    }

    // Regular message sending (chat, learn, or starting quiz)
    const userMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    const assistantMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);
    abortControllerRef.current = new AbortController();

    const systemPrompt = typeof SYSTEM_PROMPTS[mode] === 'function' 
      ? SYSTEM_PROMPTS[mode](topic, difficulty)
      : SYSTEM_PROMPTS[mode];

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: content.trim() },
          ],
          stream: true,
          temperature: mode === 'quiz' ? 0.3 : 0.7,
          max_tokens: 4096,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.content;
              if (delta) {
                accumulatedContent += delta;
                setMessages(prev => prev.map(m => 
                  m.id === assistantMessage.id ? { ...m, content: accumulatedContent } : m
                ));
              }
            } catch (e) {}
          }
        }
      }

      // Parse quiz question if in quiz mode
      if (mode === 'quiz') {
        const newQuestion = parseQuizQuestion(accumulatedContent);
        if (newQuestion) {
          setQuizState(prev => ({ ...prev, currentQuestion: newQuestion, selectedAnswer: null, showResult: false }));
        }
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMessage.id ? { ...m, content: accumulatedContent, isStreaming: false } : m
      ));

    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to send message');
        setMessages(prev => prev.filter(m => m.id !== assistantMessage.id));
      } else {
        setMessages(prev => prev.map(m => 
          m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
        ));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [model, messages, isStreaming, generateId, setError, quizState.currentQuestion, quizState.showResult]);

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearChat = useCallback(() => {
    abortStream();
    setMessages([]);
    setQuizState({ currentQuestion: null, selectedAnswer: null, showResult: false, score: { correct: 0, total: 0 } });
    setError(null);
  }, [abortStream, setError]);

  const resetQuiz = useCallback(() => {
    setQuizState({ currentQuestion: null, selectedAnswer: null, showResult: false, score: { correct: 0, total: 0 } });
  }, []);

  const submitQuizAnswer = useCallback((userAnswer, correctAnswer, explanation) => {
    const isCorrect = userAnswer === correctAnswer;
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: userAnswer,
      showResult: true,
      score: {
        correct: prev.score.correct + (isCorrect ? 1 : 0),
        total: prev.score.total + 1
      }
    }));
  }, []);

  return { messages, isStreaming, sendMessage, clearChat, abortStream, quizState, resetQuiz, submitQuizAnswer };
}