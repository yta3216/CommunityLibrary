import { apiRequest } from "./client";

export function getChats() {
  return apiRequest("/api/chats");
}

export function sendBorrowRequest(bookId, text) {
  return apiRequest("/api/chats/messages", {
    method: "POST",
    body: { bookId, text },
  });
}

export function sendChatMessage(chatId, text) {
  return apiRequest(`/api/chats/${chatId}/messages`, {
    method: "POST",
    body: { text },
  });
}

export function lendBook(chatId) {
  return apiRequest(`/api/chats/${chatId}/lend`, {
    method: "PATCH",
  });
}

export function returnBorrowedBook(chatId) {
  return apiRequest(`/api/chats/${chatId}/return`, {
    method: "PATCH",
  });
}
