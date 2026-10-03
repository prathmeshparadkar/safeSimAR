import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'There are no active records matching your current filter criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-industrial-surface border border-industrial-border rounded-lg">
      <AlertCircle className="w-12 h-12 text-slate-500 mb-3" />
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-safety-orange text-white text-xs font-semibold rounded hover:bg-safety-orangeDark transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
