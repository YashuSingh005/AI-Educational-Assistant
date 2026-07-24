import React from 'react';

export default function QuizOption({ 
  letter, 
  text, 
  isSelected, 
  isCorrect, 
  showResult, 
  onClick, 
  disabled 
}) {
  let baseClass = 'quiz-option flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-slate-100';
  
  if (showResult) {
    if (isCorrect) {
      baseClass += ' bg-green-500/20 border-green-500 text-green-300';
    } else if (isSelected) {
      baseClass += ' bg-red-500/20 border-red-500 text-red-300';
    } else {
      baseClass += ' bg-slate-800/50 border-slate-700 text-slate-500';
    }
  } else if (isSelected) {
    baseClass += ' bg-accent-primary/20 border-accent-primary text-accent-primary';
  } else {
    baseClass += ' bg-slate-800/30 border-slate-700 hover:border-accent-primary/50 hover:bg-accent-primary/10';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || showResult}
      className={baseClass}
      style={{ cursor: showResult ? 'default' : 'pointer' }}
    >
      <span className={`w-6 h-6 flex items-center justify-center rounded-full border-2 font-semibold text-sm ${
        showResult 
          ? (isCorrect ? 'border-green-500 text-green-400' : (isSelected ? 'border-red-500 text-red-400' : 'border-slate-600 text-slate-500'))
          : (isSelected ? 'border-accent-primary text-accent-primary bg-accent-primary/20' : 'border-slate-600 text-slate-400')
      }`}>
        {showResult && isCorrect ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : showResult && isSelected ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          letter
        )}
      </span>
      <span className="flex-1 text-left">{text}</span>
      {showResult && isCorrect && (
        <span className="text-xs font-medium text-green-400">Correct</span>
      )}
      {showResult && isSelected && !isCorrect && (
        <span className="text-xs font-medium text-red-400">Wrong</span>
      )}
    </button>
  );
}