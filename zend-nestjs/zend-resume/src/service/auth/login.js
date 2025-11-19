import fetcher from "../fetcher";

export const login = async ({ email, password }) =>
  fetcher("/auth/login", {
    method: "POST",
    body: { email, password },
  });

export default login;

