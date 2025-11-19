import fetcher from "@/service/fetcher";

const appendCacheBuster = (path) => {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}t=${Date.now()}`;
};

export const getProfiles = async (token) => {
  const response = await fetcher(appendCacheBuster("/profiles"), {
    method: "GET",
    token,
    cache: "no-store",
  });

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export const getProfileById = async (profileId, token) => {
  if (!profileId) {
    throw new Error("Profile id is required");
  }

  const response = await fetcher(appendCacheBuster(`/profiles/${profileId}`), {
    method: "GET",
    token,
    cache: "no-store",
  });

  return response?.data ?? null;
};

export default getProfiles;

