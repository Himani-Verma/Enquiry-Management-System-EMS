// Centralized validation rules for all dashboard forms

export const validationRules = {
  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters'
    },
    maxLength: {
      value: 100,
      message: 'Name must not exceed 100 characters'
    },
    pattern: {
      value: /^[a-zA-Z\s'-]+$/,
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  
  email: {
    required: 'Email is required',
    maxLength: {
      value: 100,
      message: 'Email must not exceed 100 characters'
    },
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email (e.g., user@example.com)'
    }
  },
  
  phone: {
    required: 'Phone number is required',
    validate: {
      onlyNumbers: (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        if (value && value.length > 0 && digitsOnly.length === 0) {
          return 'Phone number must contain digits';
        }
        return true;
      },
      exactLength: (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
          return 'Phone number must be exactly 10 digits';
        }
        return true;
      },
      noLeadingZero: (value: string) => {
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length > 0 && digitsOnly.startsWith('0')) {
          return 'Phone number cannot start with 0';
        }
        return true;
      }
    },
    pattern: {
      value: /^[0-9+\s\-()]*$/,
      message: 'Phone number can only contain numbers and +, -, (, ), spaces'
    }
  },
  
  organization: {
    maxLength: {
      value: 100,
      message: 'Organization name must not exceed 100 characters'
    }
  },
  
  subject: {
    maxLength: {
      value: 200,
      message: 'Subject must not exceed 200 characters'
    }
  },
  
  message: {
    required: 'Message is required',
    minLength: {
      value: 10,
      message: 'Message must be at least 10 characters'
    },
    maxLength: {
      value: 1000,
      message: 'Message must not exceed 1000 characters'
    }
  },
  
  enquiryDetails: {
    maxLength: {
      value: 1000,
      message: 'Enquiry details must not exceed 1000 characters'
    }
  },
  
  comments: {
    maxLength: {
      value: 1000,
      message: 'Comments must not exceed 1000 characters'
    }
  }
};

// Conditional validation rules
export const conditionalRules = {
  emailOrPhone: (email: string, phone: string): string | true => {
    if (!email && !phone) {
      return 'Either email or phone number is required';
    }
    return true;
  }
};
