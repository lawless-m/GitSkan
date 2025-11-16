# GitSkan

A mobile-first web application for managing GitHub repository branches. Clean up dangling branches created by Claude Code for Web sessions, right from your phone.

## Live App

**Visit: [https://lawless-m.github.io/GitSkan/](https://lawless-m.github.io/GitSkan/)**

No installation required! Just visit the URL, login with GitHub, and start managing your branches.

## Features

- 🔐 **GitHub OAuth** - One-click login with GitHub (or use Personal Access Token)
- 📱 **Mobile-First Design** - Optimized for iPhone Safari and mobile browsers
- 🔍 **Repository Browser** - View all your repos and their branches
- ✂️ **Branch Management** - Merge or delete branches with confirmation
- ⚡ **Fast & Responsive** - Built with Svelte for optimal performance
- 🌙 **Dark Mode** - Respects your system preference
- 📊 **Smart Sorting** - Repos sorted by branch count (most branches first)

## Quick Start

### Option 1: OAuth Login (Recommended)

1. Visit the deployed app (see Setup section for deployment)
2. Click "Login with GitHub"
3. Authorize the app
4. Start managing your branches!

### Option 2: Personal Access Token

1. Visit the app
2. Click "Use Personal Access Token"
3. Create a token at [GitHub Settings > Tokens](https://github.com/settings/tokens/new)
   - Select `repo` scope (required for branch operations)
   - Generate and copy the token
4. Paste your token and login
5. Browse your repos and manage branches!

## Usage

### Viewing Branches

- Tap a repository card to expand and view its branches
- Default branch is highlighted with a badge
- See last commit date, author, and message for each branch

### Managing Branches

**Merge a Branch:**
- Tap the "Merge" button on any non-default branch
- Confirm the merge
- After successful merge, you'll be prompted to delete the merged branch

**Delete a Branch:**
- Tap the "Delete" button
- Confirm deletion (this cannot be undone!)
- Branch is removed from GitHub

### Security

- Your token is stored locally in your browser's localStorage
- **Always logout on shared devices**
- You can revoke tokens at [GitHub Settings > Applications](https://github.com/settings/tokens)

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone git@github.com:lawless-m/GitSkan.git
cd GitSkan

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

#### Option 1: Netlify (Recommended for OAuth)

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure environment variables (for OAuth):
   - `VITE_GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
4. Deploy!

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed OAuth configuration.

#### Option 2: GitHub Pages (Static only, no OAuth)

The app automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions. Note: OAuth requires serverless functions, so only Personal Access Token login works with GitHub Pages.

## Technical Stack

- **Framework:** Svelte 4
- **Build Tool:** Vite 5
- **APIs:** GitHub GraphQL API + REST API
- **Hosting:** Netlify (recommended) or GitHub Pages
- **Serverless:** Netlify Functions (for OAuth)
- **CI/CD:** GitHub Actions / Netlify

## Project Structure

```
GitSkan/
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages deployment
├── netlify/
│   └── functions/
│       └── oauth-callback.js # OAuth token exchange
├── src/
│   ├── lib/
│   │   ├── github.js       # GitHub API client
│   │   ├── auth.js         # OAuth & PAT authentication
│   │   └── stores.js       # Svelte stores
│   ├── components/
│   │   ├── Header.svelte
│   │   ├── RepoCard.svelte
│   │   ├── BranchItem.svelte
│   │   ├── ActionButtons.svelte
│   │   ├── Modal.svelte
│   │   └── Toast.svelte
│   ├── App.svelte          # Main app component
│   ├── Callback.svelte     # OAuth callback handler
│   ├── main.js
│   └── app.css
├── netlify.toml            # Netlify configuration
├── index.html
├── vite.config.js
├── package.json
├── OAUTH_SETUP.md          # OAuth setup guide
└── README.md
```

## Roadmap

### Phase 1: MVP ✅
- [x] Personal Access Token authentication
- [x] Repository and branch listing
- [x] Delete branch functionality
- [x] Merge branch functionality
- [x] Mobile-responsive design
- [x] GitHub Pages deployment
- [x] GitHub OAuth authentication
- [x] Netlify deployment support

### Phase 2: Enhanced Features
- [ ] Batch operations (select multiple branches)
- [ ] Better sorting/filtering options
- [ ] Pull-to-refresh gesture
- [ ] Branch comparison (ahead/behind indicators)

### Phase 3: PWA & Polish
- [ ] Progressive Web App (installable)
- [ ] Offline support
- [ ] Add to home screen
- [ ] Swipe gestures
- [ ] Analytics

## FAQ

**Q: Is my token secure?**
A: Your token is stored in your browser's localStorage and never sent anywhere except directly to GitHub's API. However, always logout on shared devices and revoke tokens you no longer need.

**Q: What permissions do I need to grant?**
A: Only the `repo` scope is required. This allows GitSkan to read repositories and manage branches.

**Q: Can I delete protected branches?**
A: No. GitHub's API will prevent deletion of protected branches and GitSkan will show an error message.

**Q: What happens if I delete a branch with uncommitted changes?**
A: The branch and its commits will be permanently deleted from GitHub. Make sure you've merged any important changes first!

**Q: Does this work on desktop?**
A: Yes! While designed for mobile, GitSkan works perfectly on desktop browsers too.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [GitHub API documentation](https://docs.github.com/en/rest)

## Acknowledgments

Built to solve the problem of accumulating branches from Claude Code for Web sessions. Inspired by the need for a simple, mobile-friendly branch management tool.
