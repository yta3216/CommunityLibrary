import { apiRequest, toQueryString } from "./client";

export function getBook(bookId) {
  return apiRequest(`/api/books/${bookId}`);
}

export function getBooks(query = "") {
  return apiRequest(`/api/books${toQueryString(query)}`);
}

export function getPopularBooks(query = "") {
  return apiRequest(`/api/books/popular${toQueryString(query)}`);
}

export function createBook(payload) {
  return apiRequest("/api/books", {
    method: "POST",
    body: payload,
  });
}

export function updateBook(bookId, payload) {
  return apiRequest(`/api/books/${bookId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteBook(bookId) {
  return apiRequest(`/api/books/${bookId}`, {
    method: "DELETE",
  });
}

export function toggleBookStatus(bookId) {
  return apiRequest(`/api/books/${bookId}/toggle-status`, {
    method: "PATCH",
  });
}

export function returnBook(bookId) {
  return apiRequest(`/api/books/${bookId}/return`, {
    method: "PATCH",
  });
}
