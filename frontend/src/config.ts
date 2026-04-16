const configuredBaseUrl = import.meta.env.VITE_BACKEND_URL?.trim();

const normalizedBase = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, '')
  : 'http://localhost:3001/api';

export const API_BASE = normalizedBase;
