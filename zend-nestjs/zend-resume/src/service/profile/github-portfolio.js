const query = `
  query($login: String!) {
    user(login: $login) {
      name
      login
      avatarUrl
      followers {
        totalCount
      }
      following {
        totalCount
      }
      starredRepositories {
        totalCount
      }
      contributionsCollection {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoryContributions
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            id
            name
            description
            url
            forkCount
            stargazerCount
            updatedAt
            primaryLanguage {
              name
              color
            }
          }
        }
      }
      topRepositories(first: 6, orderBy: { field: STARGAZERS, direction: DESC }) {
        nodes {
          id
          name
          description
          url
          forkCount
          stargazerCount
          updatedAt
          primaryLanguage {
            name
            color
          }
        }
      }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        privacy: PUBLIC
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          id
          name
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            totalSize
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

const getGithubPortfolio = async (login = "zendlll66") => {
  const response = await fetch("/api/github/portfolio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { login },
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message || "Failed to fetch GitHub portfolio";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  return payload?.data?.user ?? null;
};

export default getGithubPortfolio;

