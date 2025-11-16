<script>
  export let title = '';
  export let message = '';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let confirmType = 'primary'; // primary, success, danger
  export let onConfirm = () => {};
  export let onCancel = () => {};
</script>

<div class="modal-backdrop" on:click={onCancel}>
  <div class="modal" on:click|stopPropagation>
    <h3 class="modal-title">{title}</h3>
    <p class="modal-message">{message}</p>
    <div class="modal-actions">
      <button class="ghost" on:click={onCancel}>{cancelText}</button>
      <button class={confirmType} on:click={onConfirm}>{confirmText}</button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    padding: var(--spacing-md);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    max-width: 400px;
    width: 100%;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-title {
    margin-bottom: var(--spacing-md);
  }

  .modal-message {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-lg);
    line-height: 1.6;
  }

  .modal-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }

  .modal-actions button {
    flex: 1;
  }
</style>
