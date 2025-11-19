import fetcher from "@/service/fetcher";

const appendCacheBuster = (path) => {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}t=${Date.now()}`;
};

export const getActivities = async (token) => {
  const response = await fetcher(appendCacheBuster("/activities"), {
    method: "GET",
    token,
    cache: "no-store",
  });

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export const getActivityById = async (activityId, token) => {
  if (!activityId) {
    throw new Error("Activity id is required");
  }

  const response = await fetcher(appendCacheBuster(`/activities/${activityId}`), {
    method: "GET",
    token,
    cache: "no-store",
  });

  return response?.data ?? null;
};

export const getActivitiesByTag = async (tag, token) => {
  if (!tag) {
    return [];
  }

  const encoded = encodeURIComponent(tag);
  const response = await fetcher(appendCacheBuster(`/activities/tag/${encoded}`), {
    method: "GET",
    token,
    cache: "no-store",
  });

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export default getActivities;

