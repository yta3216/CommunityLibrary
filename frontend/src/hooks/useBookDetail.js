import { useEffect, useState } from "react";
import { getBook } from "../api/books";

const POLL_INTERVAL = 10000;

export function useBookDetail(bookId) {
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!bookId) return;

        let isMounted = true;

        const fetch = async (isInitial = false) => {
            if (isInitial) {
                setIsLoading(true);
                setErrorMessage("");
            }

            try {
                const data = await getBook(bookId);
                if (isMounted) setBook(data);
            } catch (error) {
                if (isMounted && isInitial) {
                    setErrorMessage(error?.message || "Could not load book details.");
                }
            } finally {
                if (isMounted && isInitial) setIsLoading(false);
            }
        };

        fetch(true);

        const pollTimer = window.setInterval(() => fetch(false), POLL_INTERVAL);

        return () => {
            isMounted = false;
            window.clearInterval(pollTimer);
        };
    }, [bookId]);

    return { book, updateBook: setBook, isLoading, errorMessage };
}