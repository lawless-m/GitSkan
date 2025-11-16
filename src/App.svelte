<script>
  import { onMount } from 'svelte';
  import { isAuthenticated, loading, repos, token } from './lib/stores.js';
  import { initAuth, login } from './lib/auth.js';
  import { fetchAllRepositories } from './lib/github.js';
  import { showToast } from './lib/stores.js';
  import Header from './components/Header.svelte';
  import RepoCard from './components/RepoCard.svelte';
  import Toast from './components/Toast.svelte';

  let tokenInput = '';
  let loginError = '';
  let isLoading = false;

  onMount(async () => {
    // Try to restore session from localStorage
    const authenticated = await initAuth();
    if (authenticated) {
      await loadRepositories();
    }
  });

  async function handleLogin(e) {
    e.preventDefault();
    loginError = '';

    if (!tokenInput.trim()) {
      loginError = 'Please enter a token';
      return;
    }

    isLoading = true;
    const result = await login(tokenInput.trim());
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

        <form on:submit={handleLogin}>
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
              Login
            {/if}
          </button>
        </form>

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

  /* Form button full width */
  form button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }
</style>
