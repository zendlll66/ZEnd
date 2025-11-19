import fetcher from "@/service/fetcher";

const getEducationHistory = async (token) => {
  const cacheBuster = new URLSearchParams({ t: Date.now().toString() });

  const response = await fetcher(`/education-history?${cacheBuster.toString()}`, {
    method: "GET",
    token,
    cache: "no-store",
  });

  if (response?.data) {
    return response.data;
  }

  return [];
};

export default getEducationHistory;

