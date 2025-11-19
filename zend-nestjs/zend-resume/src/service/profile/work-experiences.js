import fetcher from "@/service/fetcher";

const getWorkExperiences = async (token) => {
  const cacheBuster = new URLSearchParams({ t: Date.now().toString() });

  const response = await fetcher(`/work-experiences?${cacheBuster.toString()}`, {
    method: "GET",
    token,
    cache: "no-store",
  });

  if (response?.data) {
    return response.data;
  }

  return [];
};

export default getWorkExperiences;

