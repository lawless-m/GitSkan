import { token, user } from './stores.js';
import { getUser } from './github.js';

// OAuth configuration
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const OAUTH_CALLBACK_FUNCTION = import.meta.env.VITE_OAUTH_CALLBACK_URL || '/.netlify/functions/oauth-callback';

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
 * Start OAuth flow - redirect to GitHub
 */
export function startOAuthFlow() {
  // Generate random state for CSRF protection
  const state = generateRandomString(32);
  localStorage.setItem('oauth_state', state);

  // Build OAuth authorization URL
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: window.location.origin + '/callback',
    scope: 'repo',
    state: state
  });

  // Redirect to GitHub
  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Handle OAuth callback
 * Called after GitHub redirects back to our app
 */
export async function handleOAuthCallback(code, state) {
  // Verify state to prevent CSRF attacks
  const savedState = localStorage.getItem('oauth_state');
  localStorage.removeItem('oauth_state');

  if (!savedState || savedState !== state) {
    return {
      success: false,
      error: 'Invalid state parameter. Please try logging in again.'
    };
  }

  try {
    // Exchange code for access token via our serverless function
    const response = await fetch(OAUTH_CALLBACK_FUNCTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error || 'Failed to authenticate with GitHub'
      };
    }

    // We have the access token, now get user info and complete login
    const userData = await getUser(data.access_token);
    token.set(data.access_token);
    user.set(userData);

    return { success: true };

  } catch (err) {
    return {
      success: false,
      error: err.message || 'Failed to complete authentication'
    };
  }
}

/**
 * Login with Personal Access Token (alternative to OAuth)
 */
export async function loginWithPAT(pat) {
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
  localStorage.removeItem('oauth_state');
}

/**
 * Generate random string for state parameter
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}
