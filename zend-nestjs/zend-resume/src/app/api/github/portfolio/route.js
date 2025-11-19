"use server";

import { NextResponse } from "next/server";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const { GITHUB_TOKEN } = process.env;

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

const summarizeLanguageUsage = (repositories = []) => {
  if (!Array.isArray(repositories) || repositories.length === 0) {
    return {
      totalBytes: 0,
      repositoriesAnalyzed: 0,
      languages: [],
    };
  }

  const totals = new Map();
  let aggregateBytes = 0;

  repositories.forEach((repo) => {
    const edges = repo?.languages?.edges;
    if (!Array.isArray(edges)) {
      return;
    }

    edges.forEach((edge) => {
      const size = Number(edge?.size) || 0;
      const name = edge?.node?.name;
      if (!name || size <= 0) {
        return;
      }

      aggregateBytes += size;
      const existing = totals.get(name) || {
        name,
        color: edge?.node?.color || "#94a3b8",
        totalBytes: 0,
        repoCount: 0,
      };

      existing.totalBytes += size;
      existing.repoCount += 1;
      existing.color = existing.color || edge?.node?.color || "#94a3b8";
      totals.set(name, existing);
    });
  });

  const languages = Array.from(totals.values())
    .map((entry) => ({
      ...entry,
      percentage: aggregateBytes ? (entry.totalBytes / aggregateBytes) * 100 : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return {
    totalBytes: aggregateBytes,
    repositoriesAnalyzed: repositories.length,
    languages,
  };
};

const fetchPortfolio = async (login) => {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN env is missing");
  }

  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { login },
    }),
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    const message =
      payload?.errors?.map((error) => error.message).join(", ") || "GitHub request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload?.data?.user;
};

export async function POST(request) {
  const { variables = {}, query: providedQuery } = await request.json();
  const login = variables?.login || "zendlll66";

  if (providedQuery && providedQuery !== query) {
    return NextResponse.json(
      { status: "error", message: "Custom queries are not supported." },
      { status: 400 }
    );
  }

  try {
    const portfolio = await fetchPortfolio(login);
    const { repositories, ...restPortfolio } = portfolio || {};
    const languageSummary = summarizeLanguageUsage(repositories?.nodes || []);

    return NextResponse.json(
      {
        data: {
          user: {
            ...restPortfolio,
            languageSummary,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch GitHub portfolio data" },
      { status: error.status || 500 }
    );
  }
}

