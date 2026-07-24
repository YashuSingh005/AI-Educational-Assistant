const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const OPENROUTER_API_URL = `${API_BASE_URL}/chat`;

export const INITIAL_MODEL = 'meta-llama/llama-3.3-70b-instruct';

export const AVAILABLE_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta' },
  { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'Meta' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'google/gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'anthropic/claude-3.5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'mistralai/mistral-large-2411', name: 'Mistral Large', provider: 'Mistral' },
];

export const MODES = [
  { id: 'chat', name: 'Chat', icon: '💬', desc: 'General conversation' },
  { id: 'learn', name: 'Learn', icon: '📚', desc: 'Explain concepts, teach topics' },
  { id: 'quiz', name: 'Quiz', icon: '🧠', desc: 'Test your knowledge with questions' },
];

export const DIFFICULTIES = [
  { id: 'easy', name: 'Beginner', desc: 'Basic concepts, simple explanations' },
  { id: 'medium', name: 'Intermediate', desc: 'Moderate depth, practical examples' },
  { id: 'hard', name: 'Advanced', desc: 'Deep dive, complex topics, edge cases' },
];

export const SYSTEM_PROMPTS = {
  chat: 'You are a helpful, concise, and knowledgeable AI assistant. Provide clear, accurate, and well-structured responses.',
  learn: (topic, difficulty) => `You are an expert teacher explaining "${topic}" at a ${difficulty} level.
  
Guidelines:
- ${difficulty === 'easy' ? 'Use simple language, analogies, and basic examples. Avoid jargon.' : ''}
- ${difficulty === 'medium' ? 'Include practical examples, code snippets, and real-world applications.' : ''}
- ${difficulty === 'hard' ? 'Cover advanced concepts, edge cases, best practices, and architectural patterns.' : ''}
- Structure with clear headings, bullet points, and summaries.
- Encourage learning with follow-up questions or exercises.`,
  quiz: (topic, difficulty) => `You are a quiz master creating ${difficulty} level questions about "${topic}".

Generate ONE multiple-choice question at a time. Format your response EXACTLY as:

**Question:** [Your question here]

**Options:**
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]

**Answer:** [A/B/C/D]
**Explanation:** [Why this is correct and others are not]

Wait for user to answer before providing the next question. Track score if user wants.`,
};

export const DEFAULT_SYSTEM_PROMPT = 'You are a helpful, concise, and knowledgeable AI assistant. Provide clear, accurate, and well-structured responses.';