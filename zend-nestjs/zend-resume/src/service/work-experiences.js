import fetcher from "@/service/fetcher";

export const getWorkExperiences = async () => {
  const response = await fetcher("/work-experiences", {
    method: "GET",
    cache: "no-store",
  });
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

export const createWorkExperience = async (payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher("/work-experiences", {
    method: "POST",
    token,
    body: payload,
  });
  return response?.data ?? null;
};

export const updateWorkExperience = async (id, payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher(`/work-experiences/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return response?.data ?? null;
};

export const deleteWorkExperience = async (id, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  await fetcher(`/work-experiences/${id}`, {
    method: "DELETE",
    token,
  });
  return true;
};

export default getWorkExperiences;

