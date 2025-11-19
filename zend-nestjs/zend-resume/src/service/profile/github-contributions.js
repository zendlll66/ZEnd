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

const getGithubContributions = async (login = "zendlll66", year = new Date().getFullYear()) => {
  const from = new Date(Date.UTC(year, 0, 1)).toISOString();
  const to = new Date(Date.UTC(year + 1, 0, 1)).toISOString();

  const response = await fetch("/api/github/contributions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { login, from, to, year },
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message || "Failed to fetch contributions";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  return payload?.data?.user?.contributionsCollection?.contributionCalendar ?? null;
};

export default getGithubContributions;

