const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const buildUrl = (path) => {
  if (!path) {
    throw new Error("fetcher: 'path' argument is required");
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (!API_BASE_URL) {
    throw new Error("fetcher: NEXT_PUBLIC_API_URL is not defined");
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const parseJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

const buildHeaders = (headers = {}, { body, token } = {}) => {
  const nextHeaders = new Headers(headers);
  if (isObject(body) && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }
  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", "application/json");
  }
  if (token && !nextHeaders.has("Authorization")) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }
  return nextHeaders;
};

const serializeBody = (body) => {
  if (body === undefined || body === null) {
    return undefined;
  }
  if (typeof body === "string" || body instanceof FormData || body instanceof Blob) {
    return body;
  }
  if (isObject(body)) {
    return JSON.stringify(body);
  }
  return body;
};

export default async function fetcher(path, { body, token, headers, ...options } = {}) {
  const url = buildUrl(path);
  const init = {
    ...options,
    headers: buildHeaders(headers, { body, token }),
  };
  const serializedBody = serializeBody(body);
  if (serializedBody !== undefined) {
    init.body = serializedBody;
  }

  const response = await fetch(url, init);
  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const error = new Error(payload?.message || response.statusText || "Request failed");
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload;
}

