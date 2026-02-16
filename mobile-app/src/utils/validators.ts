
import { VALIDATION } from '@/constants';

export const validateEmail = (email: string): boolean => {
  if (!email || email.includes('..')) {
    return false;
  }
  return VALIDATION.EMAIL_REGEX.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION.PHONE_REGEX.test(phone);
};

export const validateAadhar = (aadhar: string): boolean => {
  return VALIDATION.AADHAR_REGEX.test(aadhar);
};

export const validatePAN = (pan: string): boolean => {
  return VALIDATION.PAN_REGEX.test(pan.toUpperCase());
};

export const validatePincode = (pincode: string): boolean => {
  return VALIDATION.PINCODE_REGEX.test(pincode);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { isValid: true, message: '' };
};

export const validateName = (name: string): boolean => {
  return name.length >= VALIDATION.NAME_MIN_LENGTH && name.length <= VALIDATION.NAME_MAX_LENGTH;
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateMatchingPasswords = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const validateNumber = (value: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }
  return !isNaN(Number(value)) && value.trim() !== '';
};

export const validatePositiveNumber = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

export const validatePercentage = (value: string | number): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0 && num <= 100;
};
