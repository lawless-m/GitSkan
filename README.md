# GitSkan

A mobile-first web application for managing GitHub repository branches. Clean up dangling branches created by Claude Code for Web sessions, right from your phone.

## Live App

**Visit: [https://lawless-m.github.io/GitSkan/](https://lawless-m.github.io/GitSkan/)**

No installation required! Just visit the URL, login with GitHub, and start managing your branches.

## Features

- 🔐 **Secure Authentication** - Login with your GitHub Personal Access Token
- 📱 **Mobile-First Design** - Optimized for iPhone Safari and mobile browsers
- 🔍 **Repository Browser** - View all your repos and their branches
- ✂️ **Branch Management** - Merge or delete branches with confirmation
- ⚡ **Fast & Responsive** - Built with Svelte for optimal performance
- 🌙 **Dark Mode** - Respects your system preference
- 📊 **Smart Sorting** - Repos sorted by branch count (most branches first)

## Quick Start

1. Visit [https://lawless-m.github.io/GitSkan/](https://lawless-m.github.io/GitSkan/)
2. Create a Personal Access Token:
   - Go to [GitHub Settings > Tokens](https://github.com/settings/tokens/new)
   - Select `repo` scope (required for branch operations)
   - Generate and copy the token
3. Paste your token into GitSkan and click Login
4. Browse your repos and manage branches!

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

The app automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

## Technical Stack

- **Framework:** Svelte 4
- **Build Tool:** Vite 5
- **APIs:** GitHub GraphQL API + REST API
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions

## Project Structure

```
GitSkan/
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages deployment
├── src/
│   ├── lib/
│   │   ├── github.js       # GitHub API client
│   │   ├── auth.js         # Authentication logic
│   │   └── stores.js       # Svelte stores
│   ├── components/
│   │   ├── Header.svelte
│   │   ├── RepoCard.svelte
│   │   ├── BranchItem.svelte
│   │   ├── ActionButtons.svelte
│   │   ├── Modal.svelte
│   │   └── Toast.svelte
│   ├── App.svelte          # Main app component
│   ├── main.js
│   └── app.css
├── public/
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Roadmap

### Phase 1: MVP ✅
- [x] Personal Access Token authentication
- [x] Repository and branch listing
- [x] Delete branch functionality
- [x] Mobile-responsive design
- [x] GitHub Pages deployment

### Phase 2: Enhanced Features
- [ ] OAuth flow (replace PAT entry)
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
