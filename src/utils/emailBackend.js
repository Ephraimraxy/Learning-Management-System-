export const shouldUseBackendEmail = () => {
  const flag = import.meta.env.VITE_USE_EMAIL_BACKEND ?? process.env.REACT_APP_USE_EMAIL_BACKEND;
  if (flag === undefined || flag === null) {
    return !(import.meta.env.DEV || process.env.NODE_ENV === 'development');
  }
  return String(flag).toLowerCase() === 'true';
};

export const getEmailApiBaseUrl = () => {
  const explicit = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  return '';
};


