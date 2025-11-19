import fetcher from "@/service/fetcher";

const updateProfile = async (payload, token) => {
  if (!token) {
    throw new Error("Missing auth token");
  }

  const response = await fetcher("/profiles", {
    method: "PUT",
    token,
    body: payload,
  });

  return response?.data ?? null;
};

export default updateProfile;

