import React from 'react';

interface ErrorMessageProps {
 message: string;
 id?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, id }) => (
 <div id={id} className="flex items-start mt-1 text-red-600 animate-fadeIn" role="alert">
 <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
 </svg>
 <p className="text-xs font-medium">{message}</p>
 </div>
);
