import { apiRequest } from "./client";

export function getUsers() {
  return apiRequest("/api/users");
}

export function updateCurrentUser(payload) {
  return apiRequest("/api/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export function cycleUserRole(userId) {
  return apiRequest(`/api/users/${userId}/cycle-role`, {
    method: "PATCH",
  });
}

export function toggleUserStatus(userId) {
  return apiRequest(`/api/users/${userId}/toggle-status`, {
    method: "PATCH",
  });
}

export function deleteUser(userId) {
  return apiRequest(`/api/users/${userId}`, {
    method: "DELETE",
  });
}

export function getMyBooks() {
  return apiRequest("/api/users/me/books");
}