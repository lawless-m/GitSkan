<script>
  import { expandedRepos, token } from '../lib/stores.js';
  import { deleteBranch, mergeBranch } from '../lib/github.js';
  import { showToast } from '../lib/stores.js';
  import BranchItem from './BranchItem.svelte';
  import Modal from './Modal.svelte';

  export let repo;
  export let onBranchDeleted;

  let isExpanded = false;
  let showDeleteModal = false;
  let showMergeModal = false;
  let branchToDelete = null;
  let branchToMerge = null;

  $: isExpanded = $expandedRepos.has(repo.id);
  $: branchCount = repo.branches.length;
  $: nonDefaultBranches = repo.branches.filter(b => !b.isDefault);

  function toggle() {
    expandedRepos.update(set => {
      const newSet = new Set(set);
      if (newSet.has(repo.id)) {
        newSet.delete(repo.id);
      } else {
        newSet.add(repo.id);
      }
      return newSet;
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays < 7) return `Updated ${diffDays} days ago`;
    if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
    return `Updated ${Math.floor(diffDays / 30)} months ago`;
  }

  function requestDelete(branchName) {
    branchToDelete = branchName;
    showDeleteModal = true;
  }

  function requestMerge(branchName) {
    branchToMerge = branchName;
    showMergeModal = true;
  }

  async function confirmDelete() {
    showDeleteModal = false;
    try {
      await deleteBranch($token, repo.owner, repo.name, branchToDelete);
      showToast(`Branch "${branchToDelete}" deleted successfully`, 'success');
      onBranchDeleted(repo.id, branchToDelete);
    } catch (err) {
      showToast(err.message, 'error');
    }
    branchToDelete = null;
  }

  async function confirmMerge() {
    showMergeModal = false;
    try {
      await mergeBranch($token, repo.owner, repo.name, branchToMerge, repo.defaultBranch);
      showToast(`Branch "${branchToMerge}" merged successfully`, 'success');
      // After successful merge, ask if user wants to delete
      setTimeout(() => {
        branchToDelete = branchToMerge;
        showDeleteModal = true;
      }, 500);
    } catch (err) {
      showToast(err.message, 'error');
    }
    branchToMerge = null;
  }

  function cancelDelete() {
    showDeleteModal = false;
    branchToDelete = null;
  }

  function cancelMerge() {
    showMergeModal = false;
    branchToMerge = null;
  }
</script>

<div class="repo-card">
  <button class="repo-header" on:click={toggle}>
    <div class="repo-info">
      <div class="repo-name">{repo.fullName}</div>
      <div class="repo-meta text-secondary">{formatDate(repo.pushedAt)}</div>
    </div>
    <div class="repo-badge">
      {#if nonDefaultBranches.length > 0}
        <span class="branch-count">{nonDefaultBranches.length}</span>
      {/if}
      <span class="expand-icon">{isExpanded ? '▲' : '▼'}</span>
    </div>
  </button>

  {#if isExpanded}
    <div class="branches-list">
      {#each repo.branches as branch (branch.name)}
        <BranchItem
          {branch}
          {repo}
          onDelete={requestDelete}
          onMerge={requestMerge}
        />
      {/each}
    </div>
  {/if}
</div>

{#if showDeleteModal}
  <Modal
    title="Delete branch?"
    message="Delete branch '{branchToDelete}'? This cannot be undone."
    confirmText="Delete"
    confirmType="danger"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />
{/if}

{#if showMergeModal}
  <Modal
    title="Merge branch?"
    message="Merge '{branchToMerge}' into '{repo.defaultBranch}'?"
    confirmText="Merge"
    confirmType="success"
    onConfirm={confirmMerge}
    onCancel={cancelMerge}
  />
{/if}

<style>
  .repo-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);
    overflow: hidden;
  }

  .repo-header {
    width: 100%;
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    min-height: var(--min-touch-target);
  }

  .repo-header:active {
    background-color: var(--bg-secondary);
  }

  .repo-info {
    flex: 1;
  }

  .repo-name {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 4px;
    color: var(--text-primary);
  }

  .repo-meta {
    font-size: 13px;
  }

  .repo-badge {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .branch-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    background-color: var(--accent-color);
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .expand-icon {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .branches-list {
    border-top: 1px solid var(--border-color);
  }
</style>
