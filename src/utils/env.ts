/**
 * Environment variable utilities for browser compatibility
 * 
 * This helper module provides a consistent way to access environment variables
 * in both development and production environments.
 */

interface EnvVariables {
  SMS_API_KEY?: string;
  SMS_API_URL?: string;
  WHATSAPP_API_KEY?: string;
  WHATSAPP_API_URL?: string;
  // Add other environment variables as needed
}

/**
 * Gets an environment variable with proper fallbacks for browser environments
 * Works with Vite, Create React App, and custom environment configurations
 */
export const getEnv = (key: keyof EnvVariables, defaultValue: string = ''): string => {
  // Check window.env first (runtime-injected variables)
  if (typeof window !== 'undefined' && window && (window as any).env && (window as any).env[key]) {
    return (window as any).env[key];
  }
  
  // Check Vite's environment variables
  if (import.meta && import.meta.env && (import.meta.env as any)[`VITE_${key}`]) {
    return (import.meta.env as any)[`VITE_${key}`];
  }
  
  // Check Create React App environment variables
  if (typeof process !== 'undefined' && process.env && process.env[`REACT_APP_${key}`]) {
    return process.env[`REACT_APP_${key}`];
  }
  
  // Return default value if not found
  return defaultValue;
};

/**
 * Checks if we're running in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Checks if we're running in a development environment
 */
export const isDevelopment = isBrowser && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1');

/**
 * Safely access environment variables
 */
export const env = {
  SMS_API_KEY: getEnv('SMS_API_KEY', 'demo_key_for_testing'),
  SMS_API_URL: getEnv('SMS_API_URL', 'https://api.textlocal.in/send/'),
  WHATSAPP_API_KEY: getEnv('WHATSAPP_API_KEY', 'demo_key_for_testing'),
  WHATSAPP_API_URL: getEnv('WHATSAPP_API_URL', ''),
  isDevelopment,
  isBrowser
};

export default env;
