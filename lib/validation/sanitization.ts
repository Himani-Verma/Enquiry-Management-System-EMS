// Input sanitization utilities

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove angle brackets
};

export const sanitizeFormData = <T extends Record<string, any>>(
  formData: T
): T => {
  const sanitized = { ...formData };
  
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  });
  
  return sanitized;
};
