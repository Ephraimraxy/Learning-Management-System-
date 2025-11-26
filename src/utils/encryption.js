import CryptoJS from 'crypto-js';

const getSecretKey = () => {
  const secret = import.meta.env.VITE_PENDING_SECRET || process.env.REACT_APP_PENDING_SECRET;
  if (secret && secret.trim()) {
    return secret.trim();
  }
  // Fallback for local development; should be overridden in production env vars
  return 'local-pending-secret';
};

export const encryptValue = (value) => {
  if (!value) return '';
  const secretKey = getSecretKey();
  return CryptoJS.AES.encrypt(value, secretKey).toString();
};

export const decryptValue = (encrypted) => {
  if (!encrypted) return '';
  try {
    const secretKey = getSecretKey();
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || '';
  } catch (error) {
    console.error('Failed to decrypt value', error);
    return '';
  }
};


