<script>
  import { onMount } from 'svelte';
  import { handleOAuthCallback } from './lib/auth.js';

  let loading = true;
  let error = null;

  onMount(async () => {
    // Get code and state from URL parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const errorParam = params.get('error');

    if (errorParam) {
      error = 'Authorization failed: ' + (params.get('error_description') || errorParam);
      loading = false;
      return;
    }

    if (!code || !state) {
      error = 'Missing authorization parameters';
      loading = false;
      return;
    }

    // Handle the OAuth callback
    const result = await handleOAuthCallback(code, state);

    if (result.success) {
      // Redirect to main app
      window.location.href = '/';
    } else {
      error = result.error;
      loading = false;
    }
  });
</script>

<div class="callback-screen">
  <div class="callback-card">
    {#if loading}
      <div class="loading-state">
        <span class="spinner"></span>
        <h2>Completing login...</h2>
        <p class="text-secondary">Please wait while we authenticate you with GitHub</p>
      </div>
    {:else if error}
      <div class="error-state">
        <h2>Authentication Failed</h2>
        <p class="error-message">{error}</p>
        <a href="/" class="button primary">Return to Login</a>
      </div>
    {/if}
  </div>
</div>

<style>
  .callback-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  }

  .callback-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    max-width: 450px;
    width: 100%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  h2 {
    margin: 0;
  }

  .error-message {
    color: var(--danger-color);
    padding: var(--spacing-md);
    background-color: rgba(248, 81, 73, 0.1);
    border-radius: var(--radius-sm);
    margin: var(--spacing-md) 0;
  }

  .button {
    display: inline-block;
    padding: var(--spacing-sm) var(--spacing-lg);
    background-color: var(--accent-color);
    color: white;
    text-decoration: none;
    border-radius: var(--radius-sm);
    font-weight: 500;
    margin-top: var(--spacing-md);
  }

  .button:hover {
    text-decoration: none;
    opacity: 0.9;
  }
</style>
