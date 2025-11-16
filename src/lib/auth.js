import { token, user } from './stores.js';
import { getUser } from './github.js';

/**
 * Initialize authentication
 * Checks if token exists and validates it
 */
export async function initAuth() {
  const storedToken = localStorage.getItem('gh_token');

  if (!storedToken) {
    return false;
  }

  try {
    const userData = await getUser(storedToken);
    token.set(storedToken);
    user.set(userData);
    return true;
  } catch (err) {
    // Token is invalid, clear it
    logout();
    return false;
  }
}

/**
 * Login with Personal Access Token
 */
export async function login(pat) {
  try {
    const userData = await getUser(pat);
    token.set(pat);
    user.set(userData);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Invalid token. Please check and try again.'
    };
  }
}

/**
 * Logout - clear token and user data
 */
export function logout() {
  token.set(null);
  user.set(null);
  localStorage.removeItem('gh_token');
}
