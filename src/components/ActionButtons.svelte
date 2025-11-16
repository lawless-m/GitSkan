<script>
  export let onMerge = null;
  export let onDelete = null;
  export let onSkip = null;
  export let disabled = false;
</script>

<div class="action-buttons">
  {#if onMerge}
    <button class="success" on:click={onMerge} disabled={disabled}>
      Merge
    </button>
  {/if}
  {#if onDelete}
    <button class="danger" on:click={onDelete} disabled={disabled}>
      Delete
    </button>
  {/if}
  {#if onSkip}
    <button class="ghost" on:click={onSkip} disabled={disabled}>
      Skip
    </button>
  {/if}
</div>

<style>
  .action-buttons {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }

  .action-buttons button {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
  }
</style>
