import { useCallback, useEffect, useMemo, useState } from "react";
import { createBook as createBookRequest, getBooks, getPopularBooks } from "../api/books";
import { isListingAvailable } from "../utils/bookAvailability";
import { useSSE } from "./useSSE";

const DEBOUNCE_DELAY = 300;

export default function useBooks(searchTerm, { fetchPopular = false } = {}) {
    const [books, setBooks] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetch = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const data = await getBooks(searchTerm);
                if (isMounted) {
                    setBooks(Array.isArray(data) ? data : []);
                }
            } catch (_error) {
                if (isMounted) {
                    setErrorMessage("Could not load books right now.");
                    setBooks([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        const timerId = window.setTimeout(fetch, DEBOUNCE_DELAY);
        return () => {
            isMounted = false;
            window.clearTimeout(timerId);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (!fetchPopular) return;

        let isMounted = true;

        const fetch = async () => {
            try {
                const data = await getPopularBooks(searchTerm);
                if (isMounted) {
                    setPopularBooks(Array.isArray(data) ? data : []);
                }
            } catch (_error) {
                if (isMounted) setPopularBooks([]);
            }
        };

        const timerId = window.setTimeout(fetch, DEBOUNCE_DELAY);
        return () => {
            isMounted = false;
            window.clearTimeout(timerId);
        };
    }, [searchTerm, fetchPopular]);

    useSSE(["books"], {
        "book:created": (book) => setBooks((prev) => [book, ...prev]),
        "book:updated": (updated) =>{
            setBooks((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
            setPopularBooks((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
        },
        "book:deleted": ({ bookId }) => {
            setBooks((prev) => prev.filter((b) => b._id !== bookId));
            setPopularBooks((prev) => prev.filter((b) => b._id !== bookId));
        },
    });

    const availableBooks = useMemo(() => books.filter((book) => isListingAvailable(book)), [books]);

    const recentBooks = useMemo(() => {
        return [...availableBooks]
            .sort((a, b) => {
                const timeA = a.createdAt
                    ? new Date(a.createdAt).getTime()
                    : parseInt(String(a._id).substring(0, 8), 16) * 1000;
                const timeB = b.createdAt
                    ? new Date(b.createdAt).getTime()
                    : parseInt(String(b._id).substring(0, 8), 16) * 1000;
                return timeB - timeA;
            })
            .slice(0, 5);
    }, [availableBooks]);
 
    const createBook = useCallback(async (values) => {
        const result = await createBookRequest(values);
        setBooks((prev) => [result, ...prev]);
        return result;
    }, []);

    return {
        books,
        setBooks,
        availableBooks,
        popularBooks,
        recentBooks,
        isLoading,
        errorMessage,
        createBook,
    };
}