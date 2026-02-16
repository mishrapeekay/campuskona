
import {
  validateEmail,
  validatePhone,
  validateAadhar,
  validatePAN,
  validatePincode,
  validatePassword,
  validateName,
  validateRequired,
  validateMatchingPasswords,
  validateNumber,
  validatePositiveNumber,
  validatePercentage,
} from '../utils/validators';
import { VALIDATION } from '../constants';

describe('validateEmail', () => {
  it('should return true for valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('john.doe123@sub.domain.co.in')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('test@.com')).toBe(false);
    expect(validateEmail('test@example')).toBe(false);
    expect(validateEmail('test@example.c')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('test@example..com')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('should return true for valid 10-digit Indian phone numbers starting with 6-9', () => {
    expect(validatePhone('9876543210')).toBe(true);
    expect(validatePhone('6123456789')).toBe(true);
  });

  it('should return false for invalid phone numbers', () => {
    expect(validatePhone('1234567890')).toBe(false); // Starts with 1
    expect(validatePhone('987654321')).toBe(false); // Less than 10 digits
    expect(validatePhone('98765432101')).toBe(false); // More than 10 digits
    expect(validatePhone('abcdefghij')).toBe(false);
    expect(validatePhone('')).toBe(false);
  });
});

describe('validateAadhar', () => {
  it('should return true for valid 12-digit Aadhar numbers', () => {
    expect(validateAadhar('123456789012')).toBe(true);
  });

  it('should return false for invalid Aadhar numbers', () => {
    expect(validateAadhar('12345678901')).toBe(false); // Less than 12 digits
    expect(validateAadhar('1234567890123')).toBe(false); // More than 12 digits
    expect(validateAadhar('abcdefghijkl')).toBe(false);
    expect(validateAadhar('')).toBe(false);
  });
});

describe('validatePAN', () => {
  it('should return true for valid PAN numbers', () => {
    expect(validatePAN('ABCDE1234F')).toBe(true);
    expect(validatePAN('abcde1234f')).toBe(true); // Should convert to uppercase internally
  });

  it('should return false for invalid PAN numbers', () => {
    expect(validatePAN('ABCDE1234')).toBe(false); // Too short
    expect(validatePAN('ABCDE1234FG')).toBe(false); // Too long
    expect(validatePAN('1BCDE1234F')).toBe(false); // First char not alpha
    expect(validatePAN('ABCDE12345')).toBe(false); // Last char not alpha
    expect(validatePAN('')).toBe(false);
  });
});

describe('validatePincode', () => {
  it('should return true for valid 6-digit pincode', () => {
    expect(validatePincode('123456')).toBe(true);
  });

  it('should return false for invalid pincodes', () => {
    expect(validatePincode('12345')).toBe(false); // Too short
    expect(validatePincode('1234567')).toBe(false); // Too long
    expect(validatePincode('abcde')).toBe(false);
    expect(validatePincode('')).toBe(false);
  });
});

describe('validatePassword', () => {
  const minLength = VALIDATION.PASSWORD_MIN_LENGTH;
  const baseValidPassword = 'Pass@123';

  it('should return true for a valid password that meets min length', () => {
    const validPassword = baseValidPassword.padEnd(minLength, 'a');
    expect(validatePassword(validPassword).isValid).toBe(true);
  });

  it('should return false if password is too short', () => {
    const shortPassword = baseValidPassword.slice(0, minLength - 1);
    const result = validatePassword(shortPassword);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain(`Password must be at least ${minLength} characters long`);
  });

  it('should return false if password has no lowercase letter', () => {
    const noLower = 'PASSWORD@123'.padEnd(minLength, 'A');
    const result = validatePassword(noLower);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Password must contain at least one lowercase letter');
  });

  it('should return false if password has no uppercase letter', () => {
    const noUpper = 'password@123'.padEnd(minLength, 'a');
    const result = validatePassword(noUpper);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Password must contain at least one uppercase letter');
  });

  it('should return false if password has no number', () => {
    const noNumber = 'Password@'.padEnd(minLength, 'a');
    const result = validatePassword(noNumber);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Password must contain at least one number');
  });

  it('should return false if password has no special character', () => {
    const noSpecial = 'Password123'.padEnd(minLength, 'a');
    const result = validatePassword(noSpecial);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Password must contain at least one special character');
  });

  it('should return false for an empty password', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain(`Password must be at least ${minLength} characters long`);
  });
});

describe('validateName', () => {
  const minLength = VALIDATION.NAME_MIN_LENGTH;
  const maxLength = VALIDATION.NAME_MAX_LENGTH;

  it('should return true for a valid name within length constraints', () => {
    expect(validateName('John Doe')).toBe(true);
    expect(validateName('A'.repeat(minLength))).toBe(true);
    expect(validateName('A'.repeat(maxLength))).toBe(true);
  });

  it('should return false if name is too short', () => {
    expect(validateName('A'.repeat(minLength - 1))).toBe(false);
    expect(validateName('')).toBe(false);
  });

  it('should return false if name is too long', () => {
    expect(validateName('A'.repeat(maxLength + 1))).toBe(false);
  });
});

describe('validateRequired', () => {
  it('should return true for non-empty strings', () => {
    expect(validateRequired('hello')).toBe(true);
    expect(validateRequired(' ')).toBe(false); // Should trim
  });

  it('should return false for empty strings', () => {
    expect(validateRequired('')).toBe(false);
  });

  it('should return true for non-null/non-undefined values', () => {
    expect(validateRequired(0)).toBe(true);
    expect(validateRequired(false)).toBe(true);
    expect(validateRequired({})).toBe(true);
    expect(validateRequired([])).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(validateRequired(null)).toBe(false);
    expect(validateRequired(undefined)).toBe(false);
  });
});

describe('validateMatchingPasswords', () => {
  it('should return true if passwords match', () => {
    expect(validateMatchingPasswords('password123', 'password123')).toBe(true);
  });

  it('should return false if passwords do not match', () => {
    expect(validateMatchingPasswords('password123', 'password321')).toBe(false);
  });

  it('should return false if one password is empty', () => {
    expect(validateMatchingPasswords('password123', '')).toBe(false);
    expect(validateMatchingPasswords('', 'password123')).toBe(false);
  });

  it('should return true if both passwords are empty', () => {
    expect(validateMatchingPasswords('', '')).toBe(true);
  });
});

describe('validateNumber', () => {
  it('should return true for valid number strings', () => {
    expect(validateNumber('123')).toBe(true);
    expect(validateNumber('123.45')).toBe(true);
    expect(validateNumber('-123')).toBe(true);
    expect(validateNumber('0')).toBe(true);
  });

  it('should return false for invalid number strings', () => {
    expect(validateNumber('abc')).toBe(false);
    expect(validateNumber('123a')).toBe(false);
    expect(validateNumber('')).toBe(false);
    expect(validateNumber(' ')).toBe(false);
    expect(validateNumber(null as any)).toBe(false); 
    expect(validateNumber(undefined as any)).toBe(false);
  });
});

describe('validatePositiveNumber', () => {
  it('should return true for positive number strings or numbers', () => {
    expect(validatePositiveNumber('10')).toBe(true);
    expect(validatePositiveNumber(10)).toBe(true);
    expect(validatePositiveNumber('0.1')).toBe(true);
    expect(validatePositiveNumber(0.1)).toBe(true);
  });

  it('should return false for zero or negative numbers', () => {
    expect(validatePositiveNumber('0')).toBe(false);
    expect(validatePositiveNumber(0)).toBe(false);
    expect(validatePositiveNumber('-10')).toBe(false);
    expect(validatePositiveNumber(-10)).toBe(false);
  });

  it('should return false for non-numeric values', () => {
    expect(validatePositiveNumber('abc')).toBe(false);
    expect(validatePositiveNumber('')).toBe(false);
    expect(validatePositiveNumber(null as any)).toBe(false);
    expect(validatePositiveNumber(undefined as any)).toBe(false);
  });
});

describe('validatePercentage', () => {
  it('should return true for valid percentage values (0-100)', () => {
    expect(validatePercentage('0')).toBe(true);
    expect(validatePercentage(0)).toBe(true);
    expect(validatePercentage('50')).toBe(true);
    expect(validatePercentage(50)).toBe(true);
    expect(validatePercentage('100')).toBe(true);
    expect(validatePercentage(100)).toBe(true);
    expect(validatePercentage('25.5')).toBe(true);
    expect(validatePercentage(25.5)).toBe(true);
  });

  it('should return false for values outside 0-100 range', () => {
    expect(validatePercentage('-1')).toBe(false);
    expect(validatePercentage(-1)).toBe(false);
    expect(validatePercentage('101')).toBe(false);
    expect(validatePercentage(101)).toBe(false);
  });

  it('should return false for non-numeric values', () => {
    expect(validatePercentage('abc')).toBe(false);
    expect(validatePercentage('')).toBe(false);
    expect(validatePercentage(null as any)).toBe(false);
    expect(validatePercentage(undefined as any)).toBe(false);
  });
});
