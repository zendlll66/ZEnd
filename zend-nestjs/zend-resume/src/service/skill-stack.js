import fetcher from "@/service/fetcher";

export const getSkillStacks = async () => {
  const response = await fetcher("/skill-stack", {
    method: "GET",
    cache: "no-store",
  });
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

export const getMySkillStack = async (token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher("/skill-stack/me/my-skills", {
    method: "GET",
    token,
    cache: "no-store",
  });
  return response?.data ?? null;
};

export const updateSkillStack = async (payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher("/skill-stack/me/my-skills", {
    method: "PUT",
    token,
    body: payload,
  });
  return response?.data ?? null;
};

export const deleteSkillStack = async (token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  await fetcher("/skill-stack/me/my-skills", {
    method: "DELETE",
    token,
  });
  return true;
};

export default getSkillStacks;

