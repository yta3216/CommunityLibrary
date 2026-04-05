import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyBooks } from "../api/users";
import { deleteBook, updateBook } from "../api/books";

export default function useProfileBooks() {
    const [ownedBooks, setOwnedBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedBookIdToEdit, setSelectedBookIdToEdit] = useState("");
    const [selectedBookIdToDelete, setSelectedBookIdToDelete] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeletingBook, setIsDeletingBook] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetch = async () => {
            setIsLoading(true);
            setErrorMessage("");
            try {
                const data = await getMyBooks();
                if (isMounted) {
                    setOwnedBooks(Array.isArray(data.owned) ? data.owned : []);
                    setBorrowedBooks(Array.isArray(data.borrowed) ? data.borrowed : []);
                }
            } catch (_error) {
                if (isMounted) {
                    setErrorMessage("Could not load your books right now.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetch();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (ownedBooks.length === 0) {
            setSelectedBookIdToEdit("");
            return;
        }
        const stillExists = ownedBooks.some((b) => b._id === selectedBookIdToEdit);
        if (!stillExists) {
            setSelectedBookIdToEdit(ownedBooks[0]._id);
        }
    }, [ownedBooks, selectedBookIdToEdit]);

    useEffect(() => {
        if (ownedBooks.length === 0) {
            setSelectedBookIdToDelete("");
            return;
        }
        if (!selectedBookIdToDelete) {
            setSelectedBookIdToDelete(ownedBooks[0]._id);
            return;
        }
        const stillExists = ownedBooks.some((b) => b._id === selectedBookIdToDelete);
        if (!stillExists) {
            setSelectedBookIdToDelete(ownedBooks[0]._id);
        }
    }, [ownedBooks, selectedBookIdToDelete]);

    const editInitialValues = useMemo(() => {
        const book = ownedBooks.find((b) => b._id === selectedBookIdToEdit) || ownedBooks[0];
        if (!book) return { isbn: "", title: "", author: "", genre: "", description: "" };
        return {
            isbn: String(book.isbn || ""),
            title: book.title || "",
            author: book.author || "",
            genre: book.genre || "",
            description: book.description || "",
        };
    }, [ownedBooks, selectedBookIdToEdit]);

    const deleteOwnedBook = useCallback(async (bookId) => {
        setDeleteMessage("");
        setIsDeletingBook(true);
        try {
            await deleteBook(bookId);
            setOwnedBooks((prev) => prev.filter((b) => b._id !== bookId));
            setDeleteMessage("Book deleted.");
        } catch (_error) {
            setDeleteMessage("Could not delete this book right now.");
        } finally {
            setIsDeletingBook(false);
        }
    }, []);

    const editBook = useCallback(async (bookId, values) => {
        const result = await updateBook(bookId, values);
        setOwnedBooks((prev) => prev.map((b) => (b._id === result._id ? result : b)));
        setIsEditOpen(false);
    }, []);

    const clearDeleteMessage = useCallback(() => setDeleteMessage(""), []);

    return {
        ownedBooks,
        borrowedBooks,
        isLoading,
        errorMessage,
        selectedBookIdToEdit,
        setSelectedBookIdToEdit,
        selectedBookIdToDelete,
        setSelectedBookIdToDelete,
        editInitialValues,
        isEditOpen,
        setIsEditOpen,
        isDeletingBook,
        deleteMessage,
        clearDeleteMessage,
        deleteOwnedBook,
        editBook,
    };
}