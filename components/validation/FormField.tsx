import React from 'react';
import { ErrorMessage } from './ErrorMessage';
import { SuccessIcon } from './SuccessIcon';
import { getFieldStateClass, isFieldValid } from '@/lib/validation/validationHelpers';

interface FormFieldProps {
 label: string;
 name: string;
 type?: string;
 value: string;
 error?: string;
 touched?: boolean;
 required?: boolean;
 placeholder?: string;
 onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const FormField: React.FC<FormFieldProps> = ({
 label,
 name,
 type = 'text',
 value,
 error,
 touched = false,
 required = false,
 placeholder,
 onChange,
 onBlur
}) => {
 const fieldStateClass = getFieldStateClass(value, error, touched);
 const isValid = isFieldValid(value, error, touched);
 
 return (
 <div>
 <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
 {label} {required && <span className="text-red-500">*</span>}
 </label>
 <div className="relative">
 <input
 id={name}
 name={name}
 type={type}
 value={value}
 onChange={onChange}
 onBlur={onBlur}
 placeholder={placeholder}
 aria-label={label}
 aria-invalid={error ? 'true' : 'false'}
 aria-describedby={error ? `${name}-error` : undefined}
 aria-required={required}
 className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${fieldStateClass}`}
 />
 {isValid && <SuccessIcon />}
 </div>
 {error && touched && (
 <ErrorMessage message={error} id={`${name}-error`} />
 )}
 </div>
 );
};
