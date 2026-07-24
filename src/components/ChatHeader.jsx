import React from 'react';

export default function ChatHeader({ 
  onClear, 
  disabled,
  model,
  onModelChange,
  models,
  mode,
  onModeChange,
  modes,
  difficulty,
  onDifficultyChange,
  difficulties,
  topic,
  onTopicChange,
  showTopicInput
}) {
  return (
    <header className="border-b border-dark-border bg-dark-card/50 backdrop-blur-sm p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-slate-100 text-lg">AI Tutor</h1>
            <p className="text-xs text-slate-500">Educational Assistant powered by OpenRouter</p>
          </div>
        </div>
        
        <button
          onClick={onClear}
          disabled={disabled}
          className="clear-btn text-sm"
          aria-label="Clear conversation"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 px-2">Mode:</span>
          <div className="flex gap-1 bg-dark-bg rounded-lg p-1">
            {modes.map(m => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                disabled={disabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === m.id
                    ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-border'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 px-2">Model:</span>
          <select
            value={model}
            onChange={e => onModelChange(e.target.value)}
            disabled={disabled}
            className="flex-1 min-w-0 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent appearance-none"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 px-2">Difficulty:</span>
          <div className="flex gap-1 bg-dark-bg rounded-lg p-1 flex-1">
            {difficulties.map(d => (
              <button
                key={d.id}
                onClick={() => onDifficultyChange(d.id)}
                disabled={disabled}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all text-center ${
                  difficulty === d.id
                    ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-border'
                }`}
                title={d.desc}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {showTopicInput && (
          <div className="relative">
            <label htmlFor="topic" className="text-xs text-slate-500">Topic to {mode === 'learn' ? 'Learn' : 'Quiz on'}</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={e => onTopicChange(e.target.value)}
              disabled={disabled}
              placeholder={mode === 'learn' ? 'e.g., React hooks, Quantum physics, Spanish verbs...' : 'e.g., JavaScript, World history, Biology...'}
              className="w-full mt-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
            />
            {topic && (
              <span className="absolute right-3 top-8 text-xs text-slate-400">{topic.length}/100</span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}