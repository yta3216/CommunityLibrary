import { useEffect, useState } from "react";
import { getBook } from "../api/books";
import { useSSE } from "./useSSE";

export function useBookDetail(bookId) {
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchBook = useCallback(async (isInitial = false) => {
        if (!bookId) return;
        if (isInitial) {
            setIsLoading(true);
            setErrorMessage("");
        }

        try {
            const data = await getBook(bookId);
            setBook(data);
        } catch (error) {
            if (isInitial) {
                setErrorMessage(error?.message || "Could not load book details.");
            }
        } finally {
            if (isInitial) setIsLoading(false);
        }
    }, [bookId]);

    useEffect(() => { fetchBook(true); }, [fetchBook]);

    useSSE(bookId ? [`book:${bookId}`] : [], {
        "book:updated": () => fetchBook(false),
        "book:deleted": () => { setBook(null), setErrorMessage("This book listing has been deleted.") },
    });

    return { book, updateBook: setBook, isLoading, errorMessage };
}