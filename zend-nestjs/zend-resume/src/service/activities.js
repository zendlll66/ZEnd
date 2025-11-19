import fetcher from "@/service/fetcher";

export const getActivities = async () => {
  const response = await fetcher("/activities", {
    method: "GET",
    cache: "no-store",
  });
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

export const createActivity = async (payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher("/activities", {
    method: "POST",
    token,
    body: payload,
  });
  return response?.data ?? null;
};

export const updateActivity = async (id, payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher(`/activities/my-activity/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return response?.data ?? null;
};

export const deleteActivity = async (id, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  await fetcher(`/activities/my-activity/${id}`, {
    method: "DELETE",
    token,
  });
  return true;
};

export default getActivities;

