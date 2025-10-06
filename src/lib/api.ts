export function getApiBase() {
  // Vite exposes env variables on import.meta.env
  const envBase = (import.meta.env as any).VITE_API_BASE as string | undefined;
  if (envBase && envBase.trim().length > 0) return envBase.replace(/\/$/, '');

  // Default development local backend
  if (import.meta.env.DEV) return 'http://localhost:3001/api/v1';

  // Default production prefix
  return '/api/v1';
}

export default getApiBase;
