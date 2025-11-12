/**
 * Centralized email configuration
 * Uses environment variables for easy updates without code changes
 */

export const SUPPORT_EMAIL = 
  import.meta.env.VITE_SUPPORT_EMAIL || 
  'support@4bhitting.com';

export const FROM_BRAND = 
  import.meta.env.VITE_FROM_BRAND || 
  'Coach Rick @ 4B Hitting';

export const FROM_ADDRESS = `${FROM_BRAND} <${SUPPORT_EMAIL}>`;

export const REPLY_TO = SUPPORT_EMAIL;
