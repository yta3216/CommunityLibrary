import { useEffect, useState } from "react";
import { getBook } from "../api/books";

const POLL_INTERVAL = 10000;

// Fetches a single enriched book by ID on mount and polls every 10 seconds.
// The backend computes all user-specific flags (canBorrow, canReturn, etc.)
// so the hook just stores and surfaces what it receives.
// Returns updateBook so the component can apply the result of an action
// (e.g. return) without waiting for the next poll.
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
                // Poll failures are silently ignored — next interval will retry.
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