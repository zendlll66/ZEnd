import fetcher from "@/service/fetcher";

const getSkillStack = async (token) => {
  const cacheBuster = new URLSearchParams({ t: Date.now().toString() });

  const response = await fetcher(`/skill-stack?${cacheBuster.toString()}`, {
    method: "GET",
    token,
    cache: "no-store",
  });

  if (response?.data?.length) {
    return response.data[0];
  }

  return null;
};

export default getSkillStack;

