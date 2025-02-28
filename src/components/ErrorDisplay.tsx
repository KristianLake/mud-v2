import React from 'react';

interface ErrorDisplayProps {
  error: Error;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="bg-red-800 text-white rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="mb-4">{error.message}</p>
        <details className="mt-4">
          <summary className="cursor-pointer hover:underline">Show details</summary>
          <pre className="mt-2 p-2 bg-red-900 rounded overflow-x-auto text-sm">
            {error.stack || 'No stack trace available'}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default ErrorDisplay;
