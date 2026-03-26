/**
 * API Routing Utility
 * Handles difference between Development (Proxy) and Production (Relative Paths)
 */
export const getApiUrl = (endpoint) => {
  // If we are in Vite's Dev Server, use the proxy
  if (import.meta.env.DEV) {
    return `/api/${endpoint}`;
  }
  
  // In Production (XAMPP/Apache), use relative path from client/dist/
  return `../../api/${endpoint}`;
};
