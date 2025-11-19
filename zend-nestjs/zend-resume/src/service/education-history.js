import fetcher from "@/service/fetcher";

export const getEducationHistory = async () => {
  const response = await fetcher("/education-history", {
    method: "GET",
    cache: "no-store",
  });
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

export const createEducationHistory = async (payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher("/education-history", {
    method: "POST",
    token,
    body: payload,
  });
  return response?.data ?? null;
};

export const updateEducationHistory = async (id, payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  const response = await fetcher(`/education-history/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return response?.data ?? null;
};

export const deleteEducationHistory = async (id, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }
  await fetcher(`/education-history/${id}`, {
    method: "DELETE",
    token,
  });
  return true;
};

export default getEducationHistory;

