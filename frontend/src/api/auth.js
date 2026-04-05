import {
  apiRequest,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "./client";

export async function login(identifier, password) {
  const isEmailLogin = String(identifier || "").includes("@");
  const payload = {
    email: isEmailLogin ? identifier : "",
    username: isEmailLogin ? "" : identifier,
    password,
  };

  const result = await apiRequest("/api/auth/login", {
    method: "POST",
    auth: false,
    body: payload,
  });

  if (result?.token) {
    setStoredToken(result.token);
  }

  return result;
}

export async function registerUser(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    auth: false,
    body: payload,
  });
}

export async function getCurrentUser() {
  if (!getStoredToken()) {
    return null;
  }

  return apiRequest("/api/auth/me");
}

export function logout() {
  clearStoredToken();
}
