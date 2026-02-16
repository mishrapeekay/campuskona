
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  capitalizeFirstLetter,
  capitalizeWords,
  truncateText,
  formatFileSize,
  getInitials,
  maskEmail,
  maskPhoneNumber,
} from '../utils/formatters';

describe('formatCurrency', () => {
  it('should format a number into an INR currency string', () => {
    expect(formatCurrency(1000)).toBe('₹1,000');
  });

  it('should handle decimal values', () => {
    expect(formatCurrency(1234.56)).toBe('₹1,234.56');
  });

  it('should use the provided currency symbol', () => {
    expect(formatCurrency(50, 'USD')).toBe('$50');
  });

  it('should handle zero amount', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('should handle negative amount', () => {
    expect(formatCurrency(-100)).toBe('-₹100');
  });
});

describe('formatNumber', () => {
  it('should format a number with default decimals (0)', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should format a number with specified decimals', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1234.567, 1)).toBe('-1,234.6');
  });
});

describe('formatPercentage', () => {
  it('should format a number as a percentage with default decimals (2)', () => {
    expect(formatPercentage(75.1234)).toBe('75.12%');
  });

  it('should format a number as a percentage with specified decimals', () => {
    expect(formatPercentage(75.1234, 0)).toBe('75%');
  });

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0.00%');
  });

  it('should handle whole numbers', () => {
    expect(formatPercentage(100)).toBe('100.00%');
  });
});

describe('formatPhoneNumber', () => {
  it('should format a 10-digit phone number', () => {
    expect(formatPhoneNumber('1234567890')).toBe('12345 67890');
  });

  it('should return the original string if not a 10-digit number', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
    expect(formatPhoneNumber('abc-def-ghij')).toBe('abc-def-ghij');
  });

  it('should clean non-digit characters before formatting', () => {
    expect(formatPhoneNumber('(123) 456-7890')).toBe('12345 67890');
  });

  it('should handle empty string', () => {
    expect(formatPhoneNumber('')).toBe('');
  });
});

describe('capitalizeFirstLetter', () => {
  it('should capitalize the first letter and lowercase the rest', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
    expect(capitalizeFirstLetter('WORLD')).toBe('World');
    expect(capitalizeFirstLetter('tESt')).toBe('Test');
  });

  it('should handle an empty string', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('should handle a single letter string', () => {
    expect(capitalizeFirstLetter('a')).toBe('A');
  });
});

describe('capitalizeWords', () => {
  it('should capitalize the first letter of each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World');
    expect(capitalizeWords('TEST string EXAMPLE')).toBe('Test String Example');
  });

  it('should handle an empty string', () => {
    expect(capitalizeWords('')).toBe('');
  });

  it('should handle a string with only spaces', () => {
    expect(capitalizeWords('   ')).toBe('   ');
  });

  it('should handle single word string', () => {
    expect(capitalizeWords('test')).toBe('Test');
  });
});

describe('truncateText', () => {
  it('should truncate text and add ellipsis if longer than maxLength', () => {
    expect(truncateText('This is a long text to truncate', 10)).toBe('This is a ...');
  });

  it('should return original text if shorter than or equal to maxLength', () => {
    expect(truncateText('Short text', 10)).toBe('Short text');
    expect(truncateText('Exact', 5)).toBe('Exact');
  });

  it('should handle empty string', () => {
    expect(truncateText('', 5)).toBe('');
  });

  it('should handle maxLength of 0', () => {
    expect(truncateText('hello', 0)).toBe('...');
  });
});

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(500)).toBe('500 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5 * 1024
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('should handle large numbers and round to two decimal places', () => {
    expect(formatFileSize(2048576)).toBe('1.95 MB'); // ~2MB
    expect(formatFileSize(5368709120)).toBe('5 GB'); // 5 * 1024^3
  });
});

describe('getInitials', () => {
  it('should return initials for first and last name', () => {
    expect(getInitials('John', 'Doe')).toBe('JD');
  });

  it('should return only first initial if no last name', () => {
    expect(getInitials('Jane')).toBe('J');
  });

  it('should handle empty names', () => {
    expect(getInitials('', '')).toBe('');
    expect(getInitials(' ', ' ')).toBe('');
  });

  it('should handle extra spaces', () => {
    expect(getInitials('  First  ', '  Last  ')).toBe('FL');
  });
});

describe('maskEmail', () => {
  it('should mask email with more than 3 characters in username', () => {
    expect(maskEmail('johndoe@example.com')).toBe('joh***@example.com');
  });

  it('should mask email with 3 or fewer characters in username', () => {
    expect(maskEmail('abc@example.com')).toBe('a***@example.com');
    expect(maskEmail('ab@example.com')).toBe('a***@example.com');
    expect(maskEmail('a@example.com')).toBe('a***@example.com');
  });

  it('should handle email with no username part (unlikely but for robustness)', () => {
    expect(maskEmail('@example.com')).toBe('***@example.com');
  });

  it('should handle empty email string', () => {
    expect(maskEmail('')).toBe('***@'); // Based on implementation splitting by @
  });
});

describe('maskPhoneNumber', () => {
  it('should mask phone number showing only last 4 digits', () => {
    expect(maskPhoneNumber('1234567890')).toBe('******7890');
  });

  it('should return original phone number if length is 4 or less', () => {
    expect(maskPhoneNumber('1234')).toBe('1234');
    expect(maskPhoneNumber('123')).toBe('123');
    expect(maskPhoneNumber('')).toBe('');
  });
});
