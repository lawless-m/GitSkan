import { writable, derived } from 'svelte/store';

// Auth state
export const token = writable(localStorage.getItem('gh_token') || null);
export const user = writable(null);

// Subscribe to token changes to sync with localStorage
token.subscribe(value => {
  if (value) {
    localStorage.setItem('gh_token', value);
  } else {
    localStorage.removeItem('gh_token');
  }
});

// Data state
export const repos = writable([]);
export const expandedRepos = writable(new Set());

// UI state
export const loading = writable(false);
export const error = writable(null);
export const toast = writable(null);

// Derived states
export const isAuthenticated = derived(token, $token => !!$token);

// Helper to show toast notifications
export function showToast(message, type = 'info') {
  toast.set({ message, type });
  setTimeout(() => toast.set(null), 3000);
}

// Helper to toggle repo expansion
export function toggleRepo(repoId) {
  expandedRepos.update(set => {
    const newSet = new Set(set);
    if (newSet.has(repoId)) {
      newSet.delete(repoId);
    } else {
      newSet.add(repoId);
    }
    return newSet;
  });
}
