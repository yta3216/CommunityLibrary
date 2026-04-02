import { getBookUserId, isListingAvailable } from "../utils/bookAvailability";

export function mapRequesterChatsByBook(chatsPayload) {
  const requesterChats = Array.isArray(chatsPayload?.theirBooks)
    ? chatsPayload.theirBooks
    : [];

  return requesterChats.reduce((accumulator, chat) => {
    if (chat?.bookId && chat?.id) {
      accumulator[String(chat.bookId)] = String(chat.id);
    }
    return accumulator;
  }, {});
}

export function selectBookFromCollection(books, selectedBookId) {
  if (!Array.isArray(books) || books.length === 0) {
    return null;
  }

  if (!selectedBookId) {
    return books[0];
  }

  return books.find((book) => book._id === selectedBookId) || books[0];
}

export function toBookDetailModel(selectedBook) {
  if (!selectedBook) {
    return null;
  }

  const genres = (selectedBook.genre || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return {
    id: selectedBook._id,
    title: selectedBook.title || "Untitled",
    author: selectedBook.author || "Unknown author",
    isbn: selectedBook.isbn,
    ownerId: getBookUserId(selectedBook.owner),
    holderId: getBookUserId(selectedBook.holder),
    ownerName:
      typeof selectedBook.owner === "object"
        ? selectedBook.owner?.username || "Book owner"
        : "Book owner",
    genres: genres.length > 0 ? genres : ["Unknown"],
    status: isListingAvailable(selectedBook) ? "available" : "not_available",
    description: selectedBook.description || "",
  };
}

export function buildBookActionState({
  book,
  books,
  currentUserId,
  requesterChatByBook,
}) {
  const isBookAvailable = book?.status === "available";
  const existingRequesterChatId = book ? requesterChatByBook[book.id] || "" : "";
  const hasExistingConversation = Boolean(existingRequesterChatId);

  const ownsCopyWithSameIsbn = Boolean(
    currentUserId &&
      book?.isbn &&
      books.some((listedBook) => {
        const listedIsbn = String(listedBook?.isbn || "").trim();
        return (
          listedIsbn === String(book.isbn).trim() &&
          getBookUserId(listedBook.owner) === currentUserId
        );
      }),
  );

  const holdsBorrowedCopyWithSameIsbn = Boolean(
    currentUserId &&
      book?.isbn &&
      books.some((listedBook) => {
        const listedIsbn = String(listedBook?.isbn || "").trim();
        const listedOwnerId = getBookUserId(listedBook.owner);
        const listedHolderId = getBookUserId(listedBook.holder);

        return (
          listedIsbn === String(book.isbn).trim() &&
          listedHolderId === currentUserId &&
          listedOwnerId !== currentUserId
        );
      }),
  );

  const isCurrentHolder = Boolean(
    currentUserId &&
      book &&
      currentUserId === book.holderId &&
      currentUserId !== book.ownerId,
  );

  const isCurrentOwner = Boolean(
    currentUserId && book && currentUserId === book.ownerId,
  );

  const canBorrow = Boolean(
    book &&
      currentUserId &&
      !ownsCopyWithSameIsbn &&
      !holdsBorrowedCopyWithSameIsbn &&
      isBookAvailable &&
      !hasExistingConversation &&
      !isCurrentHolder,
  );

  const canReturn = Boolean(book && isCurrentHolder);

  const showBorrowButton = Boolean(
    !isCurrentHolder &&
      (ownsCopyWithSameIsbn ||
        holdsBorrowedCopyWithSameIsbn ||
        !hasExistingConversation),
  );

  const showViewConversationButton = Boolean(
    !isCurrentHolder && !ownsCopyWithSameIsbn && hasExistingConversation,
  );

  let actionHintText = "";
  if (isCurrentOwner) {
    actionHintText = "You are the owner of this book.";
  } else if (ownsCopyWithSameIsbn) {
    actionHintText = "You already own a copy of this book.";
  } else if (holdsBorrowedCopyWithSameIsbn) {
    actionHintText = "You are already borrowing another copy with this ISBN.";
  } else if (showViewConversationButton) {
    actionHintText = "You already started a conversation for this listing.";
  } else if (!isBookAvailable && !isCurrentHolder) {
    actionHintText = "This listing is currently not available for borrowing.";
  }

  return {
    isBookAvailable,
    existingRequesterChatId,
    hasExistingConversation,
    ownsCopyWithSameIsbn,
    holdsBorrowedCopyWithSameIsbn,
    isCurrentHolder,
    isCurrentOwner,
    canBorrow,
    canReturn,
    showBorrowButton,
    showViewConversationButton,
    actionHintText,
  };
}
