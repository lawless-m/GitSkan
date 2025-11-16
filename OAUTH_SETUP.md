# OAuth Setup Guide

This guide explains how to configure GitHub OAuth for GitSkan.

## Why OAuth?

OAuth provides a better user experience than Personal Access Tokens:
- ✅ No manual token creation required
- ✅ Users just click "Login with GitHub"
- ✅ Automatic authorization flow
- ✅ Tokens can be revoked from GitHub settings

## Prerequisites

1. A GitHub account
2. A Netlify account (free tier works fine)
3. Your repository deployed to Netlify

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the details:
   - **Application name**: `GitSkan` (or your preferred name)
   - **Homepage URL**: `https://your-app-name.netlify.app`
   - **Authorization callback URL**: `https://your-app-name.netlify.app/callback`
4. Click "Register application"
5. You'll see your **Client ID** - copy this
6. Click "Generate a new client secret" and copy the **Client Secret**

⚠️ **Important**: Keep your Client Secret private! Never commit it to your repository.

## Step 2: Configure Netlify

### Option A: Netlify Dashboard (Recommended)

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:
   - `GITHUB_CLIENT_ID`: Your OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`: Your OAuth App Client Secret
   - `VITE_GITHUB_CLIENT_ID`: Your OAuth App Client ID (same as above)

### Option B: netlify.toml (Not recommended for secrets)

You can add non-secret environment variables to `netlify.toml`:

```toml
[build.environment]
  VITE_GITHUB_CLIENT_ID = "your_client_id_here"
```

**Never add your Client Secret to netlify.toml!**

## Step 3: Deploy

1. Push your changes to GitHub
2. Netlify will automatically rebuild and deploy
3. Your OAuth flow should now work!

## Testing OAuth Flow

1. Visit your deployed app: `https://your-app-name.netlify.app`
2. You should see a "Login with GitHub" button
3. Click it to start the OAuth flow
4. You'll be redirected to GitHub for authorization
5. After authorizing, you'll be redirected back to GitSkan
6. You should be logged in and see your repositories

## Troubleshooting

### "Invalid client_id" error

- Double-check your `VITE_GITHUB_CLIENT_ID` in Netlify environment variables
- Make sure you've deployed after adding the environment variable
- Verify the Client ID matches exactly what's shown in GitHub OAuth App settings

### "Redirect URI mismatch" error

- Verify the callback URL in your GitHub OAuth App settings matches exactly:
  - Should be: `https://your-app-name.netlify.app/callback`
  - NOT: `https://your-app-name.netlify.app/callback/` (no trailing slash)
- Check that you're testing on the deployed URL, not localhost

### OAuth button doesn't appear

- Make sure `VITE_GITHUB_CLIENT_ID` is set in your Netlify environment variables
- Clear your browser cache and hard reload the page
- Check the browser console for any errors

### "Failed to exchange authorization code" error

- Verify `GITHUB_CLIENT_SECRET` is set correctly in Netlify environment variables
- Check that the serverless function is deployed (look for it in Netlify Functions tab)
- Make sure both `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set

### Serverless function not found (404)

- Verify that `netlify.toml` exists in your repository root
- Check that the `netlify/functions` directory exists
- Make sure Netlify detected and built your functions (check deploy log)

## Local Development

For local development with OAuth:

1. Create a `.env` file (don't commit this!):
   ```
   VITE_GITHUB_CLIENT_ID=your_client_id_here
   ```

2. For the serverless function to work locally, install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```

3. Update your GitHub OAuth App callback URL to include localhost:
   - Add: `http://localhost:8888/callback`

4. The Netlify CLI will run your site and functions locally

## Fallback: Personal Access Token

If you don't want to set up OAuth or for testing purposes:

1. Users can click "Use Personal Access Token" on the login screen
2. They create a token at: https://github.com/settings/tokens/new
3. Required scope: `repo`
4. Paste the token and login

This option is always available as a fallback even when OAuth is configured.

## Security Notes

- **Client Secret**: Never expose this in client-side code or commit it to Git
- **State parameter**: We use a cryptographically random state for CSRF protection
- **Token storage**: User tokens are stored in localStorage (inform users to logout on shared devices)
- **Scopes**: We only request `repo` scope (minimum required for branch operations)

## Production Checklist

Before going live:

- [ ] GitHub OAuth App is created
- [ ] Client ID and Client Secret are added to Netlify environment variables
- [ ] Callback URL matches your production domain exactly
- [ ] OAuth App is set to public (if you want anyone to use it)
- [ ] Test the complete OAuth flow on production URL
- [ ] Verify Personal Access Token fallback still works

## Questions?

- Check the [main README](./README.md) for general setup
- Review [GitHub OAuth documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- Check [Netlify Functions documentation](https://docs.netlify.com/functions/overview/)
