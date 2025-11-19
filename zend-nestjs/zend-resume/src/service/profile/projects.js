import fetcher from "@/service/fetcher";

const appendCacheBuster = (path) => {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}t=${Date.now()}`;
};

export const getProjects = async (token) => {
  const response = await fetcher(appendCacheBuster("/projects"), {
    method: "GET",
    token,
    cache: "no-store",
  });

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export const getProjectsByTag = async (tag, token) => {
  if (!tag) {
    return [];
  }

  const encodedTag = encodeURIComponent(tag);
  const response = await fetcher(appendCacheBuster(`/projects/tag/${encodedTag}`), {
    method: "GET",
    token,
    cache: "no-store",
  });

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export const getProjectById = async (projectId, token) => {
  if (!projectId) {
    throw new Error("Project id is required");
  }

  const response = await fetcher(appendCacheBuster(`/projects/${projectId}`), {
    method: "GET",
    token,
    cache: "no-store",
  });

  return response?.data ?? null;
};

export default getProjects;

