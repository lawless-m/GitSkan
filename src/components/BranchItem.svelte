<script>
  import ActionButtons from './ActionButtons.svelte';
  import { showToast } from '../lib/stores.js';

  export let branch;
  export let repo;
  export let onDelete;
  export let onMerge;

  let deleting = false;
  let merging = false;

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  async function handleDelete() {
    deleting = true;
    try {
      await onDelete(branch.name);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      deleting = false;
    }
  }

  async function handleMerge() {
    merging = true;
    try {
      await onMerge(branch.name);
    } catch (err) {
      console.error('Merge failed:', err);
    } finally {
      merging = false;
    }
  }
</script>

<div class="branch-item" class:is-default={branch.isDefault}>
  <div class="branch-header">
    <span class="branch-name">
      {branch.name}
      {#if branch.isDefault}
        <span class="default-badge">default</span>
      {/if}
    </span>
  </div>

  {#if !branch.isDefault}
    <div class="branch-details">
      <div class="commit-info">
        <span class="text-secondary">
          Last: {formatDate(branch.lastCommit.date)} by {branch.lastCommit.author}
        </span>
        <div class="commit-message">{branch.lastCommit.message}</div>
      </div>

      <ActionButtons
        onMerge={handleMerge}
        onDelete={handleDelete}
        disabled={deleting || merging}
      />

      {#if deleting}
        <div class="action-status">
          <span class="spinner"></span>
          Deleting...
        </div>
      {/if}

      {#if merging}
        <div class="action-status">
          <span class="spinner"></span>
          Merging...
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .branch-item {
    padding: var(--spacing-md);
    border-top: 1px solid var(--border-color);
  }

  .branch-item:first-child {
    border-top: none;
  }

  .branch-item.is-default {
    background-color: var(--bg-secondary);
  }

  .branch-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .branch-name {
    font-weight: 500;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .default-badge {
    display: inline-block;
    padding: 2px 6px;
    background-color: var(--accent-color);
    color: white;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .branch-details {
    margin-top: var(--spacing-sm);
  }

  .commit-info {
    margin-bottom: var(--spacing-sm);
  }

  .commit-info .text-secondary {
    font-size: 13px;
  }

  .commit-message {
    font-size: 14px;
    color: var(--text-primary);
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action-status {
    margin-top: var(--spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
    font-size: 14px;
  }
</style>
