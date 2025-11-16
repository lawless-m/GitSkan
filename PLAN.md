# GitSkan - GitHub Branch Management Tool

## Overview
GitSkan is a mobile-first web application for interactively managing GitHub repository branches. Built to solve the problem of dangling branches created by Claude Code for Web sessions, it allows users to browse all their repos and branches, then interactively merge or delete them directly from their phone.

## Use Case
When using Claude Code for Web, each session creates a new branch. Over time, repos accumulate many unused branches. GitSkan provides an easy way to clean these up interactively, especially on mobile devices where the branches were created.

## User Workflow
1. User visits `https://lawless-m.github.io/GitSkan/` on their iPhone
2. Clicks "Login with GitHub"
3. Authorizes the app via GitHub OAuth
4. Browses their repos and branches
5. Taps to merge or delete branches
6. Done!

**No installation, no npm, no building - just visit the URL and use it.**

## Technical Stack

### Frontend Framework
- **Svelte** with Vite
- Reasons:
  - Small bundle size (critical for mobile performance)
  - Fast runtime performance on mobile browsers
  - Simple, clean code
  - Great developer experience

### Hosting & Deployment
- **GitHub Pages** - static hosting directly from this repo
- **GitHub Actions** - automatic build and deployment
- Workflow:
  1. Code is pushed to main branch
  2. GitHub Actions runs `npm install` and `npm run build`
  3. Build output (static files) deployed to GitHub Pages
  4. User visits URL - no build process on their end

### APIs
- **GitHub GraphQL API** for fetching repos and branches
- **GitHub REST API** for merge/delete operations
- **GitHub OAuth** for authentication

## Core Features

### 1. Authentication
- GitHub OAuth flow to get user token
- Store token securely in localStorage (with user awareness)
- Scopes needed: `repo` (covers read, write, and delete for branches)
- OAuth App Configuration:
  - Homepage URL: `https://lawless-m.github.io/GitSkan/`
  - Callback URL: `https://lawless-m.github.io/GitSkan/callback`

### 2. Repository Discovery
- Fetch all repos user has access to (personal + orgs)
- Use GraphQL for efficient querying
- Handle pagination to get all repos
- Example query:
  ```graphql
  query {
    viewer {
      repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
        nodes {
          name
          nameWithOwner
          owner { login }
          defaultBranchRef { name }
          refs(refPrefix: "refs/heads/", first: 100) {
            nodes {
              name
              target {
                ... on Commit {
                  committedDate
                  author { name }
                  messageHeadline
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ```

### 3. Branch Listing
- For each repo, show:
  - Repo name
  - Default branch (main/master)
  - Number of other branches
  - Last activity date
- Expandable/collapsible repo view
- Highlight repos with multiple branches
- Sort options:
  - Most branches first (default - most useful)
  - Recently updated
  - Alphabetical

### 4. Branch Details
For each branch show:
- Branch name (clearly indicate which is default)
- Last commit date (relative time: "2 days ago")
- Last commit author
- Last commit message (first line)
- Don't show action buttons for default branch

### 5. Branch Actions

#### Merge Branch
- Merge non-default branch into default branch
- API: `POST /repos/{owner}/{repo}/merges`
  ```json
  {
    "base": "main",
    "head": "branch-to-merge"
  }
  ```
- Handle responses:
  - Success: Show confirmation, remove branch from list
  - Conflict: Show error message, suggest manual merge
  - Already merged: Inform user, offer to delete instead
- After successful merge, ask if user wants to delete the branch

#### Delete Branch
- Delete non-default branch
- API: `DELETE /repos/{owner}/{repo}/git/refs/heads/{branch}`
- Confirmation dialog before deleting
- Handle responses:
  - Success: Show confirmation, remove from list
  - Error: Show error message
  - Protected branch: Inform user branch is protected

#### Skip
- Do nothing, collapse branch list or move to next repo

### 6. Batch Operations (Phase 2)
- Select multiple branches with checkboxes
- "Delete Selected" button
- Confirmation showing count
- Execute in sequence with progress indicator
- Continue on errors, show summary at end

## UI/UX Design

### Mobile-First Approach
**Primary target**: iPhone Safari
**Also works on**: Android Chrome, desktop browsers

### Layout Components

#### 1. Header (always visible)
- "GitSkan" logo/title
- User avatar (small, right side)
- Logout button (icon)
- Refresh button (pull-to-refresh also works)

#### 2. Repository List (main view)
Card-based layout, each card:
```
┌─────────────────────────────────────┐
│ owner/repo-name            [5] ▼    │  ← Tap to expand
│ Updated 3 days ago                  │
└─────────────────────────────────────┘
```

Expanded state:
```
┌─────────────────────────────────────┐
│ owner/repo-name            [5] ▲    │  ← Tap to collapse
│ Updated 3 days ago                  │
├─────────────────────────────────────┤
│ ✓ main (default)                    │  ← Not actionable
│                                     │
│ feature-xyz                         │
│ Last: 2 days ago by matt            │
│ Add new feature                     │
│ [Merge]  [Delete]  [Skip]          │
│                                     │
│ claude-session-abc                  │
│ Last: 1 week ago by Claude          │
│ Fix bug                             │
│ [Merge]  [Delete]  [Skip]          │
└─────────────────────────────────────┘
```

#### 3. Action Buttons
- **Merge**: Green background, white text
- **Delete**: Red background, white text
- **Skip**: Gray/neutral, outlined
- Minimum height: 44px (Apple's touch target guideline)
- Clear spacing between buttons

#### 4. Modal/Dialog (confirmations)
```
┌─────────────────────────────────────┐
│  Delete branch 'feature-xyz'?       │
│                                     │
│  This cannot be undone.             │
│                                     │
│  [Cancel]           [Delete]        │
└─────────────────────────────────────┘
```

#### 5. Toast Notifications
- Top of screen, auto-dismiss after 3s
- Success: Green with checkmark
- Error: Red with X
- Info: Blue with info icon

### Mobile Interactions
- **Tap to expand/collapse** repo cards
- **Pull-to-refresh** to reload repos
- **Touch targets**: Minimum 44px height
- **Loading states**:
  - Skeleton screens while fetching repos
  - Spinners on action buttons during API calls
  - Disable buttons during operations
- **Smooth animations**: Expand/collapse transitions
- **Haptic feedback** (if available): On successful delete/merge

### Responsive Design
- Works on screen widths 320px to 1200px+
- Single column on mobile
- Optional: 2 columns on tablet/desktop
- Font sizes: Minimum 16px (prevents zoom on iOS)

### Color Scheme
Based on GitHub colors:
- Background: `#0d1117` (dark) / `#ffffff` (light)
- Cards: `#161b22` (dark) / `#f6f8fa` (light)
- Text: `#c9d1d9` (dark) / `#24292f` (light)
- Accent: GitHub blue `#58a6ff`
- Success: `#3fb950`
- Danger: `#f85149`
- Respect system dark mode preference

### Progressive Web App (PWA)
- `manifest.json` for "Add to Home Screen"
- App icon (multiple sizes)
- Service worker for offline app shell
- Works offline (shows cached UI, errors on API calls)

## Project Structure

```
GitSkan/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   └── manifest.json
├── src/
│   ├── lib/
│   │   ├── github.js           # GitHub API client
│   │   ├── auth.js             # OAuth flow handling
│   │   └── stores.js           # Svelte stores
│   ├── components/
│   │   ├── Header.svelte
│   │   ├── RepoCard.svelte     # Collapsible repo card
│   │   ├── BranchItem.svelte   # Branch with actions
│   │   ├── ActionButtons.svelte
│   │   ├── Modal.svelte        # Confirmation dialog
│   │   └── Toast.svelte        # Notifications
│   ├── App.svelte              # Main app component
│   ├── Callback.svelte         # OAuth callback handler
│   ├── main.js                 # App entry point
│   └── app.css                 # Global styles
├── .gitignore
├── .env.example                # Example environment variables
├── package.json
├── vite.config.js
├── index.html
├── PLAN.md                     # This file
└── README.md                   # User-facing docs
```

## State Management

Using Svelte stores (`src/lib/stores.js`):

```javascript
// Auth state
export const token = writable(localStorage.getItem('gh_token') || null);
export const user = writable(null);

// Data state
export const repos = writable([]);
export const expandedRepos = writable(new Set());

// UI state
export const loading = writable(false);
export const error = writable(null);
export const toast = writable(null);
```

## API Client (`src/lib/github.js`)

Core functions:

```javascript
// Authentication
export async function getUser(token)

// Repositories
export async function fetchRepositories(token, cursor = null)
export async function fetchAllRepositories(token) // Handles pagination

// Branch operations
export async function mergeBranch(token, owner, repo, head, base)
export async function deleteBranch(token, owner, repo, branch)

// Helpers
export function isRateLimited(error)
export function getRateLimitReset(error)
```

## Authentication Flow (`src/lib/auth.js`)

### Initial Auth
1. User clicks "Login with GitHub"
2. Redirect to GitHub OAuth:
   ```
   https://github.com/login/oauth/authorize?client_id=xxx&scope=repo
   ```
3. User authorizes
4. GitHub redirects to callback URL with code
5. Exchange code for token (requires proxy or GitHub App)
6. Store token in localStorage
7. Fetch user info
8. Redirect to main app

### Token Storage
- Store in localStorage: `gh_token`
- Check on app load
- If present, validate by fetching user info
- If invalid, clear and show login

### Note on OAuth
GitHub OAuth requires client_secret for token exchange, which can't be in frontend code. Options:
1. **Use GitHub App** instead of OAuth App (allows PKCE flow)
2. **Serverless function** (Vercel/Netlify function) to exchange code
3. **Ask user for Personal Access Token** (simpler, but less UX friendly)

**Recommended**: Start with option 3 (PAT) for MVP, add OAuth in Phase 2.

## GitHub Pages Deployment

### Setup Steps
1. Create `.github/workflows/deploy.yml`
2. Configure to build on push to main
3. Deploy build output to `gh-pages` branch
4. Enable GitHub Pages in repo settings, point to `gh-pages` branch

### Deploy Workflow (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Build Configuration (`vite.config.js`)
```javascript
export default {
  base: '/GitSkan/', // Important for GitHub Pages subdirectory
  build: {
    outDir: 'dist'
  }
}
```

## Environment Variables

`.env.example`:
```
# For OAuth flow (if implemented)
VITE_GITHUB_CLIENT_ID=your_client_id_here

# For development
VITE_API_BASE=https://api.github.com
```

Note: VITE_ prefix makes variables available in frontend code.

## Error Handling

### Network Errors
- Show toast: "Network error. Check connection and retry."
- Keep UI functional
- Retry button

### API Rate Limiting
- GitHub: 5000 requests/hour for authenticated users
- Show remaining requests in debug mode
- On rate limit: Show message with reset time
- Cache repo data to reduce requests

### Authentication Errors
- Token expired/invalid: Clear token, show login
- Insufficient permissions: Show message about required scopes
- Clear "Logout and re-authenticate" option

### Merge Conflicts
- Show error toast: "Cannot auto-merge. Merge manually on GitHub."
- Provide link to GitHub compare view
- Offer to delete branch instead

### Protected Branches
- API returns 403 for protected branches
- Show message: "This branch is protected and cannot be deleted."

## Security Considerations

### Token Security
- Store token in localStorage (acceptable for client-side app)
- Show clear warning: "Token stored locally. Logout on shared devices."
- Implement logout: Clears token from localStorage
- Token only has permissions user granted
- User can revoke at: https://github.com/settings/applications

### Scope Minimization
- Request only `repo` scope (covers branches, repos, commits)
- Don't request unnecessary permissions
- Explain why permission is needed in UI

### Content Security Policy
- Add CSP meta tag to prevent XSS
- Allow only GitHub API domain for fetch

## Development Phases

### Phase 1: MVP
**Goal**: Working app that can list and delete branches

- [ ] Set up Svelte + Vite project
- [ ] Create basic UI components (Header, RepoCard, BranchItem)
- [ ] Implement Personal Access Token auth (simpler than OAuth for MVP)
- [ ] Implement GitHub API client (fetch repos, fetch branches, delete branch)
- [ ] Create repo list view with expand/collapse
- [ ] Implement delete branch functionality with confirmation
- [ ] Add loading states and error handling
- [ ] Style for mobile (responsive, touch-friendly)
- [ ] Set up GitHub Actions deployment
- [ ] Deploy to GitHub Pages
- [ ] Test on iPhone Safari

### Phase 2: Enhanced Features
**Goal**: Full functionality with better UX

- [ ] Implement merge branch functionality
- [ ] Add OAuth flow (replace PAT entry)
- [ ] Batch operations (select multiple branches)
- [ ] Better sorting/filtering options
- [ ] Pull-to-refresh gesture
- [ ] Dark mode toggle (override system preference)
- [ ] Toast notifications system
- [ ] Show branch comparison (ahead/behind default)
- [ ] Skeleton loading screens
- [ ] Polish animations and transitions

### Phase 3: PWA & Polish
**Goal**: App-like experience

- [ ] Add PWA manifest.json
- [ ] Create app icons (multiple sizes)
- [ ] Implement service worker for offline shell
- [ ] Add to home screen prompt
- [ ] Haptic feedback (where supported)
- [ ] Swipe gestures (swipe to delete?)
- [ ] Better error recovery
- [ ] Analytics (optional, privacy-respecting)
- [ ] Onboarding/help screen

## Testing Strategy

### Manual Testing Checklist
- [ ] Login flow works
- [ ] Repos load correctly
- [ ] Branches display with correct info
- [ ] Delete branch works
- [ ] Merge branch works
- [ ] Error states display properly
- [ ] Works on iPhone Safari (primary)
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers
- [ ] Touch targets are adequate size
- [ ] Loading states show during operations
- [ ] Logout clears token

### Test Scenarios
1. **Happy path**: Login, view repos, delete a branch
2. **Merge conflict**: Try to merge a conflicting branch
3. **Network error**: Disable network mid-operation
4. **Rate limiting**: Make many requests quickly
5. **Protected branch**: Try to delete protected branch
6. **Token expiry**: Use expired token
7. **Many repos**: Test with account that has 100+ repos
8. **Many branches**: Test repo with 50+ branches

### Browser Testing
- iOS Safari 15+
- iOS Chrome 15+
- Android Chrome 90+
- Desktop Chrome, Firefox, Safari, Edge (latest)

## Future Enhancements

### Nice-to-Have Features
- **Search/filter**: Search repos and branches by name
- **Bulk patterns**: "Delete all branches matching `claude-*`"
- **Stale branch detection**: Highlight branches older than 30 days
- **Branch age sorting**: Sort by last commit date
- **Statistics**: "You've cleaned up 47 branches across 12 repos!"
- **Undo**: Keep 24-hour history of deleted branches (store metadata only)
- **PR detection**: Show if branch has open PR, prevent deletion
- **Compare view**: Show actual diff before merge
- **Dry run**: Preview what would be deleted without doing it
- **Export**: Download CSV of all branches
- **Multi-account**: Switch between GitHub accounts
- **Organization mode**: Scope to specific org
- **Desktop mode**: Use keyboard shortcuts, multi-column layout

## Getting Started

### For Development
```bash
# Clone repo
git clone git@github.com:lawless-m/GitSkan.git
cd GitSkan

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Run dev server
npm run dev
# Visit http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

### For Users
1. Visit https://lawless-m.github.io/GitSkan/
2. Login with GitHub (or enter Personal Access Token)
3. Browse and clean up branches
4. That's it!

## Resources & Documentation

- [GitHub GraphQL API Explorer](https://docs.github.com/en/graphql/overview/explorer)
- [GitHub REST API - Branches](https://docs.github.com/en/rest/branches/branches)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [Svelte Documentation](https://svelte.dev/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [GitHub Pages](https://pages.github.com/)
- [PWA Manifest](https://web.dev/add-manifest/)
- [iOS Safari Web App Meta Tags](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

## Open Questions & Decisions

### 1. Authentication Method
**Options**:
- A) Personal Access Token (user creates manually)
- B) OAuth App (automated flow, requires backend for token exchange)
- C) GitHub App with PKCE (no backend needed)

**Decision**: Start with **A** (PAT) for MVP simplicity. Users can generate token at https://github.com/settings/tokens with `repo` scope. Add OAuth in Phase 2.

### 2. Merge Strategy
**Options**:
- A) Always create merge commit
- B) Fast-forward if possible
- C) Squash merge
- D) Let user choose

**Decision**: Start with **A** (GitHub API default). Add options in Phase 2.

### 3. Default Branch Detection
**Options**:
- A) Use `defaultBranchRef` from GraphQL (most accurate)
- B) Assume `main` or `master`

**Decision**: Use **A** always. Don't assume.

### 4. Repo Filtering
**Options**:
- A) Show all repos (including forks, archived)
- B) Filter out forks by default
- C) Filter out archived by default

**Decision**: Start with **A**, add filters in Phase 2. Some users may want to clean up forks too.

### 5. Branch Action Order
When showing Merge and Delete buttons:
- A) Merge first (encouraging safer option)
- B) Delete first (it's the most common action)
- C) Most recent action first (remember user preference)

**Decision**: **A** - Merge first (left side, primary position). Encourages safer workflow.

## Notes for Claude for Web

When implementing this:

1. **Start with Phase 1 MVP** - Get a working version deployed first
2. **Test deployment early** - Set up GitHub Actions and deploy "Hello World" before building features
3. **Mobile-first CSS** - Write mobile styles first, desktop is secondary
4. **Token in URL hack for MVP** - For testing, could pass token as URL param (NOT for production)
5. **Use Vite's dev server** - Hot reload makes mobile testing easier (use ngrok to test on phone)
6. **Commit often** - Every feature should be a commit
7. **Test on real iPhone** - Simulator is not the same as actual Safari on iOS

## Success Criteria

The app is successful when:
- ✅ User can visit URL on iPhone and login
- ✅ All repos and branches load within 5 seconds
- ✅ User can delete a branch in 2 taps (branch delete button → confirm)
- ✅ UI is responsive and touch-friendly on mobile
- ✅ No crashes or breaking errors in happy path
- ✅ Works offline after initial load (shows cached UI)
- ✅ User doesn't need to understand git/GitHub internals to use it

**Primary metric**: Time from "open app" to "branch deleted" should be under 30 seconds.
