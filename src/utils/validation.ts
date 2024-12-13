/**
 * Utility functions for validating claim-related data
 */

/**
 * Check if an email domain matches a website domain
 * Handles various edge cases like www prefix, subdomains
 */
export function domainsMatch(email: string, website: string): boolean {
  try {
    // Extract email domain
    const emailDomain = email.split('@')[1].toLowerCase();
    
    // Parse website URL and get hostname
    const websiteUrl = new URL(website);
    let websiteDomain = websiteUrl.hostname.toLowerCase();
    
    // Remove www prefix if present
    websiteDomain = websiteDomain.replace(/^www\./, '');
    
    // Compare base domains
    // This will match email@example.com with:
    // - example.com
    // - www.example.com
    // - subdomain.example.com
    const emailBaseDomain = emailDomain.split('.').slice(-2).join('.');
    const websiteBaseDomain = websiteDomain.split('.').slice(-2).join('.');
    
    return emailBaseDomain === websiteBaseDomain;
  } catch (error) {
    console.error('Error validating domains:', error);
    return false;
  }
}

/**
 * Validate website URL format
 */
export function isValidWebsite(website: string): boolean {
  try {
    const url = new URL(website);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
