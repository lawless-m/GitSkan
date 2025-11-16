/**
 * GitHub API Client
 * Handles all interactions with GitHub GraphQL and REST APIs
 */

const GITHUB_API = 'https://api.github.com';
const GITHUB_GRAPHQL = 'https://api.github.com/graphql';

/**
 * Get authenticated user information
 */
export async function getUser(token) {
  const response = await fetch(`${GITHUB_API}/user`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate. Please check your token.');
  }

  return await response.json();
}

/**
 * Fetch repositories using GraphQL
 * Returns repositories with branches in a single query
 */
export async function fetchRepositories(token, cursor = null) {
  const query = `
    query($cursor: String) {
      viewer {
        repositories(first: 50, after: $cursor, orderBy: {field: PUSHED_AT, direction: DESC}) {
          nodes {
            id
            name
            nameWithOwner
            owner { login }
            defaultBranchRef { name }
            pushedAt
            refs(refPrefix: "refs/heads/", first: 100) {
              nodes {
                name
                target {
                  ... on Commit {
                    committedDate
                    author {
                      name
                      user { login }
                    }
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
  `;

  const response = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { cursor }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch repositories');
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return {
    repos: data.data.viewer.repositories.nodes,
    pageInfo: data.data.viewer.repositories.pageInfo
  };
}

/**
 * Fetch all repositories (handles pagination)
 */
export async function fetchAllRepositories(token) {
  let allRepos = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const { repos, pageInfo } = await fetchRepositories(token, cursor);
    allRepos = [...allRepos, ...repos];
    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  // Transform data for easier use in UI
  return allRepos.map(repo => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.nameWithOwner,
    owner: repo.owner.login,
    defaultBranch: repo.defaultBranchRef?.name || 'main',
    pushedAt: repo.pushedAt,
    branches: repo.refs.nodes.map(branch => ({
      name: branch.name,
      isDefault: branch.name === (repo.defaultBranchRef?.name || 'main'),
      lastCommit: {
        date: branch.target.committedDate,
        author: branch.target.author.user?.login || branch.target.author.name,
        message: branch.target.messageHeadline
      }
    }))
  }));
}

/**
 * Merge a branch into base branch
 */
export async function mergeBranch(token, owner, repo, head, base) {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/merges`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      base,
      head,
      commit_message: `Merge branch '${head}' into ${base}`
    })
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Merge conflict. Please merge manually on GitHub.');
    }
    if (response.status === 204) {
      throw new Error('Already merged or nothing to merge.');
    }
    throw new Error(data.message || 'Failed to merge branch');
  }

  return data;
}

/**
 * Delete a branch
 */
export async function deleteBranch(token, owner, repo, branch) {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    if (response.status === 422) {
      throw new Error('Branch is protected and cannot be deleted.');
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to delete branch');
  }

  return true;
}

/**
 * Check if error is due to rate limiting
 */
export function isRateLimited(error) {
  return error.message?.includes('rate limit') ||
         error.message?.includes('API rate limit');
}

/**
 * Get rate limit reset time from error
 */
export function getRateLimitReset(error) {
  // This would need to parse the error response headers
  // For now, return a default message
  return 'Please try again in a few minutes.';
}
