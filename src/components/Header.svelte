<script>
  import { user } from '../lib/stores.js';
  import { logout } from '../lib/auth.js';

  export let onRefresh = () => {};

  function handleLogout() {
    logout();
  }
</script>

<header>
  <div class="container header-content">
    <h1>GitSkan</h1>
    {#if $user}
      <div class="header-actions">
        <button class="icon-button" on:click={onRefresh} title="Refresh">
          <span class="refresh-icon">↻</span>
        </button>
        <img src={$user.avatar_url} alt={$user.login} class="avatar" />
        <button class="icon-button" on:click={handleLogout} title="Logout">
          <span>↪</span>
        </button>
      </div>
    {/if}
  </div>
</header>

<style>
  header {
    background-color: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    padding: var(--spacing-md) 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--border-color);
  }

  .icon-button {
    padding: var(--spacing-sm);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 20px;
  }

  .refresh-icon {
    display: inline-block;
    transition: transform 0.3s ease;
  }

  .icon-button:active .refresh-icon {
    transform: rotate(180deg);
  }
</style>
