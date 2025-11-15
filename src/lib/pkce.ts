/**
 * PKCE (Proof Key for Code Exchange) utilities
 * Implements RFC 7636 for secure OAuth2 flows
 * 
 * HOW IT WORKS:
 * 1. Generate code_verifier (random string, 43-128 chars)
 * 2. Compute code_challenge = SHA256(code_verifier) -> Base64 URL-safe
 * 3. Send code_challenge when initiating OAuth
 * 4. Store code_verifier in sessionStorage
 * 5. Send code_verifier when exchanging code
 * 6. Backend validates: SHA256(code_verifier) == stored code_challenge
 */

/**
 * Storage keys for PKCE data in sessionStorage
 */
const PKCE_VERIFIER_KEY = 'oauth_code_verifier';

/**
 * Generates a cryptographically random code verifier (43-128 characters).
 * Uses Web Crypto API for secure random generation.
 * 
 * @returns Base64 URL-safe encoded random string (43-128 chars)
 */
export function generateCodeVerifier(): string {
  // Generate 32 random bytes (256 bits)
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  // Convert to Base64 URL-safe encoding
  return base64UrlEncode(array);
}

/**
 * Computes code challenge from code verifier using SHA256.
 * 
 * ALGORITHM (RFC 7636):
 * 1. Hash code_verifier using SHA-256
 * 2. Encode hash as Base64 URL-safe (no padding)
 * 
 * @param verifier The plain text code verifier
 * @returns Base64 URL-safe encoded SHA256 hash (code challenge)
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  // Step 1: Hash with SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  // Step 2: Encode as Base64 URL-safe without padding
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Base64 URL-safe encoding (RFC 4648 Section 5).
 * Converts bytes to Base64 and replaces URL-unsafe characters.
 * 
 * @param array Uint8Array to encode
 * @returns Base64 URL-safe string
 */
function base64UrlEncode(array: Uint8Array): string {
  // Convert to regular Base64
  const base64 = btoa(String.fromCharCode(...array));
  
  // Convert to URL-safe: replace + with -, / with _, remove = padding
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Stores code verifier in sessionStorage.
 * SessionStorage is cleared when browser tab closes, providing security.
 * 
 * @param verifier The code verifier to store
 */
export function storeCodeVerifier(verifier: string): void {
  try {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  } catch (error) {
    console.error('Failed to store code verifier:', error);
    throw new Error('Failed to store PKCE code verifier');
  }
}

/**
 * Retrieves code verifier from sessionStorage.
 * 
 * @returns The stored code verifier, or null if not found
 */
export function getCodeVerifier(): string | null {
  try {
    return sessionStorage.getItem(PKCE_VERIFIER_KEY);
  } catch (error) {
    console.error('Failed to retrieve code verifier:', error);
    return null;
  }
}

/**
 * Clears PKCE data from sessionStorage.
 * Should be called after successful code exchange or on error.
 */
export function clearPKCEData(): void {
  try {
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  } catch (error) {
    console.error('Failed to clear PKCE data:', error);
  }
}

