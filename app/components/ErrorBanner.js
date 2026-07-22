'use client';

import { AlertCircle, X } from 'lucide-react';

export default function ErrorBanner({ message, onDismiss, className = '' }) {
  if (!message) return null;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-400 text-sm ${className}`}>
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-red-950/40 transition text-red-300"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
