import { useCallback, useEffect, useMemo, useState } from "react";
import { createBook as createBookRequest, getBooks, getPopularBooks } from "../api/books";
import { isListingAvailable } from "../utils/bookAvailability";

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
                    setPopularBooks(
                        Array.isArray(data)
                            ? data.map((item) => ({
                                ...item.bookData,
                                avgRating: item.avgRating,
                                numberOfReviews: item.numberOfReviews,
                            })) : [],
                    );
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

    const availableBooks = useMemo(() => books.filter((book) => isListingAvailable(book)), [books]);

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
        isLoading,
        errorMessage,
        createBook,
    };
}