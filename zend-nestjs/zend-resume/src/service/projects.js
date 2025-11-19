import fetcher from "@/service/fetcher";

export const getProjects = async () => {
  const response = await fetcher("/projects", {
    method: "GET",
    cache: "no-store",
  });
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

export const createProject = async (payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher("/projects", {
    method: "POST",
    token,
    body: payload,
  });
  return response?.data ?? null;
};

export const updateProject = async (id, payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher(`/projects/my-project/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return response?.data ?? null;
};

export const deleteProject = async (id, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  await fetcher(`/projects/my-project/${id}`, {
    method: "DELETE",
    token,
  });
  return true;
};

export default getProjects;

