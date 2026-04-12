/**
 * Format a date consistently between server and client to avoid hydration mismatches.
 * Uses ISO format (YYYY-MM-DD) which is locale-independent.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get the current year at build time to avoid hydration mismatches.
 * This should be used for copyright notices and similar static content.
 */
export const BUILD_YEAR = new Date().getFullYear();
