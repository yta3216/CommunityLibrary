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

//Admin functions
export function getReviewsByUser(userId) {
  return apiRequest(`/api/reviews/user/${userId}`);
}

export function deleteReview(reviewId) {
  return apiRequest(`/api/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

export function getAllReviews() {
  return apiRequest("/api/reviews/all");
}