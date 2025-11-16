<script>
  import { onMount } from 'svelte';
  import { isAuthenticated, loading, repos, token } from './lib/stores.js';
  import { initAuth, loginWithPAT, startOAuthFlow } from './lib/auth.js';
  import { fetchAllRepositories } from './lib/github.js';
  import { showToast } from './lib/stores.js';
  import Header from './components/Header.svelte';
  import RepoCard from './components/RepoCard.svelte';
  import Toast from './components/Toast.svelte';

  let tokenInput = '';
  let loginError = '';
  let isLoading = false;
  let showPATForm = false;

  // Check if OAuth is configured
  const OAUTH_ENABLED = import.meta.env.VITE_GITHUB_CLIENT_ID;

  onMount(async () => {
    // Try to restore session from localStorage
    const authenticated = await initAuth();
    if (authenticated) {
      await loadRepositories();
    }
  });

  function handleOAuthLogin() {
    startOAuthFlow();
  }

  async function handlePATLogin(e) {
    e.preventDefault();
    loginError = '';

    if (!tokenInput.trim()) {
      loginError = 'Please enter a token';
      return;
    }

    isLoading = true;
    const result = await loginWithPAT(tokenInput.trim());
    isLoading = false;

    if (result.success) {
      tokenInput = '';
      await loadRepositories();
    } else {
      loginError = result.error;
    }
  }

  async function loadRepositories() {
    if (!$token) return;

    loading.set(true);
    try {
      const data = await fetchAllRepositories($token);
      // Sort repos by branch count (most branches first)
      const sorted = data.sort((a, b) => {
        const aNonDefault = a.branches.filter(br => !br.isDefault).length;
        const bNonDefault = b.branches.filter(br => !br.isDefault).length;
        return bNonDefault - aNonDefault;
      });
      repos.set(sorted);
      showToast(`Loaded ${sorted.length} repositories`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to load repositories', 'error');
    } finally {
      loading.set(false);
    }
  }

  function handleBranchDeleted(repoId, branchName) {
    // Remove the branch from the repo in the store
    repos.update(list => {
      return list.map(repo => {
        if (repo.id === repoId) {
          return {
            ...repo,
            branches: repo.branches.filter(b => b.name !== branchName)
          };
        }
        return repo;
      });
    });
  }
</script>

<main>
  <Toast />

  {#if $isAuthenticated}
    <Header onRefresh={loadRepositories} />

    <div class="container">
      {#if $loading}
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Loading repositories...</p>
        </div>
      {:else if $repos.length === 0}
        <div class="empty-state">
          <h2>No repositories found</h2>
          <p class="text-secondary">
            You don't have any repositories yet, or they couldn't be loaded.
          </p>
          <button class="primary mt-md" on:click={loadRepositories}>
            Retry
          </button>
        </div>
      {:else}
        <div class="repos-header">
          <h2>{$repos.length} Repositories</h2>
          <p class="text-secondary">
            Showing repos sorted by number of branches
          </p>
        </div>

        <div class="repos-list">
          {#each $repos as repo (repo.id)}
            <RepoCard {repo} onBranchDeleted={handleBranchDeleted} />
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="login-screen">
      <div class="login-card">
        <h1>GitSkan</h1>
        <p class="login-subtitle text-secondary">
          Manage your GitHub branches from anywhere
        </p>

        {#if OAUTH_ENABLED && !showPATForm}
          <!-- OAuth Login (Primary) -->
          <div class="oauth-login">
            <button type="button" class="oauth-button" on:click={handleOAuthLogin}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              Login with GitHub
            </button>

            <div class="divider">
              <span>or</span>
            </div>

            <button type="button" class="ghost" on:click={() => showPATForm = true}>
              Use Personal Access Token
            </button>
          </div>
        {:else}
          <!-- PAT Login (Fallback or when OAuth not configured) -->
          <form on:submit={handlePATLogin}>
            <div class="form-group">
              <label for="token">Personal Access Token</label>
              <input
                id="token"
                type="password"
                bind:value={tokenInput}
                placeholder="ghp_xxxxxxxxxxxx"
                disabled={isLoading}
              />
              <p class="help-text text-secondary">
                Create a token at
                <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener">
                  github.com/settings/tokens
                </a>
                with <code>repo</code> scope.
              </p>
            </div>

            {#if loginError}
              <div class="error-message">
                {loginError}
              </div>
            {/if}

            <button type="submit" class="primary" disabled={isLoading}>
              {#if isLoading}
                <span class="spinner"></span>
                Logging in...
              {:else}
                Login with Token
              {/if}
            </button>

            {#if OAUTH_ENABLED}
              <button type="button" class="ghost mt-sm" on:click={() => showPATForm = false}>
                ← Back to OAuth
              </button>
            {/if}
          </form>
        {/if}

        <div class="security-notice">
          <p class="text-secondary">
            ⚠️ Your token is stored locally in your browser. Always logout on shared devices.
          </p>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .container {
    padding-top: var(--spacing-lg);
    padding-bottom: var(--spacing-xl);
  }

  /* Login Screen */
  .login-screen {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  }

  .login-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    max-width: 450px;
    width: 100%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .login-card h1 {
    font-size: 32px;
    text-align: center;
    margin-bottom: var(--spacing-sm);
  }

  .login-subtitle {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .form-group {
    margin-bottom: var(--spacing-lg);
  }

  .form-group label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
  }

  .help-text {
    margin-top: var(--spacing-sm);
    font-size: 13px;
    line-height: 1.5;
  }

  .help-text code {
    background-color: var(--bg-secondary);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 12px;
  }

  .error-message {
    padding: var(--spacing-md);
    background-color: var(--danger-color);
    color: white;
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-md);
    font-size: 14px;
  }

  .security-notice {
    margin-top: var(--spacing-lg);
    padding: var(--spacing-md);
    background-color: var(--bg-secondary);
    border-radius: var(--radius-sm);
    font-size: 13px;
  }

  /* Main App */
  .repos-header {
    margin-bottom: var(--spacing-lg);
  }

  .repos-list {
    /* List styling handled by RepoCard */
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    gap: var(--spacing-md);
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
  }

  .empty-state h2 {
    margin-bottom: var(--spacing-sm);
  }

  .empty-state p {
    margin-bottom: var(--spacing-md);
  }

  /* OAuth Login */
  .oauth-login {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .oauth-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    background-color: #24292f;
    color: white;
    border: 1px solid #24292f;
    padding: var(--spacing-md);
    font-size: 16px;
    font-weight: 600;
  }

  .oauth-button:hover {
    background-color: #2c3338;
    border-color: #2c3338;
  }

  @media (prefers-color-scheme: dark) {
    .oauth-button {
      background-color: #f6f8fa;
      color: #24292f;
      border-color: #f6f8fa;
    }

    .oauth-button:hover {
      background-color: #ffffff;
      border-color: #ffffff;
    }
  }

  .divider {
    position: relative;
    text-align: center;
    margin: var(--spacing-sm) 0;
  }

  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--border-color);
  }

  .divider span {
    position: relative;
    background-color: var(--bg-card);
    padding: 0 var(--spacing-md);
    color: var(--text-secondary);
    font-size: 13px;
  }

  /* Form button full width */
  form button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }
</style>
