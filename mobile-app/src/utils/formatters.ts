export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getInitials = (firstName: string, lastName: string = ''): string => {
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  const first = trimmedFirstName ? trimmedFirstName.charAt(0).toUpperCase() : '';
  const last = trimmedLastName ? trimmedLastName.charAt(0).toUpperCase() : '';
  
  return first + last;
};

export const maskEmail = (email: string): string => {
  const parts = email.split('@');
  let username = parts[0] || '';
  const domain = parts[1] || '';

  if (username.length <= 3 && username.length > 0) {
    username = `${username[0]}***`;
  } else if (username.length > 3) {
    username = `${username.slice(0, 3)}***`;
  } else { // Handle empty username (e.g., "@domain.com" or "")
    username = '***';
  }
  
  return `${username}@${domain}`;
};

export const maskPhoneNumber = (phone: string): string => {
  if (phone.length <= 4) return phone;
  return `******${phone.slice(-4)}`;
};
