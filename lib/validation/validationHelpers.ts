// Validation helper functions

export interface ValidationError {
  field: string;
  message: string;
}

export interface FieldState {
  value: string;
  error?: string;
  touched: boolean;
  valid: boolean;
}

// Validate a single field
export const validateField = (
  fieldName: string,
  value: any,
  rules: any
): string | null => {
  // Check if value is empty
  const isEmpty = value === null || value === undefined || value === '';
  
  if (rules.required && isEmpty) {
    return typeof rules.required === 'string' ? rules.required : 'This field is required';
  }
  
  // Skip other validations if field is empty and not required
  if (isEmpty) {
    return null;
  }
  
  if (rules.minLength && value.length < rules.minLength.value) {
    return rules.minLength.message;
  }
  
  if (rules.maxLength && value.length > rules.maxLength.value) {
    return rules.maxLength.message;
  }
  
  if (rules.pattern && !rules.pattern.value.test(value)) {
    return rules.pattern.message;
  }
  
  // Custom validation functions
  if (rules.validate) {
    for (const [key, validateFn] of Object.entries(rules.validate)) {
      if (typeof validateFn === 'function') {
        const result = validateFn(value);
        if (result !== true && typeof result === 'string') {
          return result;
        }
      }
    }
  }
  
  return null;
};

// Validate entire form
export const validateForm = (
  formData: Record<string, any>,
  rules: Record<string, any>
): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  Object.keys(rules).forEach(fieldName => {
    const error = validateField(fieldName, formData[fieldName], rules[fieldName]);
    if (error) {
      errors.push({ field: fieldName, message: error });
    }
  });
  
  return errors;
};

// Get field state class for styling
export const getFieldStateClass = (
  value: any,
  error: string | undefined,
  touched: boolean
): string => {
  if (error && touched) {
    return 'border-red-500 focus:ring-red-500 focus:border-red-500';
  }
  if (touched && !error && value) {
    return 'border-green-500 focus:ring-green-500 focus:border-green-500';
  }
  return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
};

// Check if field is valid
export const isFieldValid = (
  value: any,
  error: string | undefined,
  touched: boolean
): boolean => {
  return Boolean(touched && !error && value);
};
