import { apiRequest } from "./client";

export function getReviews(bookId) {
  return apiRequest(`/api/reviews/${bookId}`, {
    auth: false,
  });
}

export function createReview(payload) {
  return apiRequest("/api/reviews", {
    method: "POST",
    body: payload,
  });
}
