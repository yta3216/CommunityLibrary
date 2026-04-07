import { useEffect, useState } from "react";
import { getBook } from "../api/books";
import { useSSE } from "./useSSE";

export function useBookDetail(bookId) {
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!bookId) return;
        let isMounted = true;

        const fetchBook = async () => {
            try {
                const data = await getBook(bookId);
                if (isMounted) setBook(data);
            } catch (error) {
                if (isMounted) setErrorMessage(error?.message || "Could not load book details.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchBook();

        return () => { isMounted = false; };
    }, [bookId]);

    useSSE(bookId ? [`book:${bookId}`] : [], {
        "book:updated": () => getBook(bookId).then(setBook).catch(() => { }),
        "book:deleted": () => { setBook(null); setErrorMessage("This listing has been removed."); },
    });

    return { book, updateBook: setBook, isLoading, errorMessage };
}