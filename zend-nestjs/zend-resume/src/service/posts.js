import fetcher from "@/service/fetcher";

const appendCacheBuster = (path) => {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}t=${Date.now()}`;
};

export const getPosts = async (token) => {
  const response = await fetcher(appendCacheBuster("/posts"), {
    method: "GET",
    token,
    cache: "no-store",
  });

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export const createPost = async (payload, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const response = await fetcher("/posts", {
    method: "POST",
    token,
    body: payload,
  });

  return response?.data ?? null;
};

export const updateMyPost = async (postId, payload, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const response = await fetcher(`/posts/my-post/${postId}`, {
    method: "PUT",
    token,
    body: payload,
  });

  return response?.data ?? null;
};

export const deleteMyPost = async (postId, token) => {
  if (!token) {
    throw new Error("Authentication token is required");
  }

  await fetcher(`/posts/my-post/${postId}`, {
    method: "DELETE",
    token,
  });

  return true;
};

export default getPosts;

