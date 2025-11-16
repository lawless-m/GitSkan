<script>
  import { toast } from '../lib/stores.js';

  function close() {
    toast.set(null);
  }
</script>

{#if $toast}
  <div class="toast toast-{$toast.type}" on:click={close}>
    <span class="toast-icon">
      {#if $toast.type === 'success'}✓{/if}
      {#if $toast.type === 'error'}✕{/if}
      {#if $toast.type === 'info'}ℹ{/if}
    </span>
    <span class="toast-message">{$toast.message}</span>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: var(--spacing-md);
    left: 50%;
    transform: translateX(-50%);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    z-index: 1000;
    max-width: 90%;
    cursor: pointer;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .toast-success {
    background-color: var(--success-color);
    color: white;
  }

  .toast-error {
    background-color: var(--danger-color);
    color: white;
  }

  .toast-info {
    background-color: var(--accent-color);
    color: white;
  }

  .toast-icon {
    font-size: 18px;
    font-weight: bold;
  }

  .toast-message {
    flex: 1;
  }
</style>
