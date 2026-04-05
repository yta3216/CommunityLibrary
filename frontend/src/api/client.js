const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const TOKEN_STORAGE_KEY = "token";

const isBrowser = typeof window !== "undefined";

export function getStoredToken() {
  if (!isBrowser) {
    return "";
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
}

export function setStoredToken(token) {
  if (!isBrowser) {
    return;
  }

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function clearStoredToken() {
  setStoredToken("");
}

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function toJsonBody(body) {
  if (body == null || body instanceof FormData) {
    return body;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest(path, options = {}) {
  const {
    token = getStoredToken(),
    auth = true,
    headers = {},
    body,
    ...rest
  } = options;

  const requestHeaders = { ...headers };

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const requestBody = toJsonBody(body);
  if (requestBody != null && !requestHeaders["Content-Type"] && typeof requestBody === "string" && body != null && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: requestBody,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(
      (data && typeof data === "object" && data.message) || "Request failed",
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function toQueryString(q = "") {
  const trimmed = String(q || "").trim();
  return trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
}