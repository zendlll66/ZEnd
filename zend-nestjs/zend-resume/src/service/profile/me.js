import fetcher from "@/service/fetcher";

const getMyProfile = async (token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }

  const response = await fetcher("/profiles/me", {
    method: "POST",
    token,
  });

  if (response?.data) {
    return response.data;
  }

  return response;
};

export default getMyProfile;

