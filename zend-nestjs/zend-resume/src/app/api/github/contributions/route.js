"use server";

import { NextResponse } from "next/server";

const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const { GITHUB_TOKEN } = process.env;

const DEFAULT_YEAR_COUNT = 4;

const query = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`;

const getYearBounds = (year) => {
  const targetYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const fromDate = new Date(Date.UTC(targetYear, 0, 1));
  const toDate = new Date(Date.UTC(targetYear + 1, 0, 1));
  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  };
};

const fetchCalendar = async (login, { from, to, year }) => {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN env is missing");
  }

  let computedFrom = from;
  let computedTo = to;

  if (!computedFrom || !computedTo) {
    const { from: defaultFrom, to: defaultTo } = getYearBounds(year);
    computedFrom = defaultFrom;
    computedTo = defaultTo;
  }

  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        login,
        from: computedFrom,
        to: computedTo,
      },
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

  const calendar = payload?.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar) {
    throw new Error("Calendar data not found");
  }

  return calendar;
};

export async function POST(request) {
  const { query: queryBody, variables } = await request.json();
  const login = variables?.login || "zendlll66";
  const from = variables?.from;
  const to = variables?.to;
  const year = variables?.year ? Number(variables.year) : undefined;

  if (queryBody && queryBody !== query) {
    return NextResponse.json(
      {
        status: "error",
        message: "Custom queries are not supported.",
      },
      { status: 400 }
    );
  }

  try {
    const calendar = await fetchCalendar(login, { from, to, year });
    return NextResponse.json(
      {
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: calendar,
            },
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch GitHub contributions",
      },
      { status: error.status || 500 }
    );
  }
}

