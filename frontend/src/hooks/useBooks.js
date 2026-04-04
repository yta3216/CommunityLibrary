import { useEffect, useState } from "react";
import { getBooks } from "../api/books";

const DEBOUNCE_DELAY = 300; // TODO: migrate to websockets

export default function useBooks(searchTerm) {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetch = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const bookData = await getBooks(searchTerm);
                if (isMounted) {
                    setBooks(Array.isArray(bookData) ? bookData : []);
                }
            } catch (error) {
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

        const debounceTimerId = window.setTimeout(fetch, DEBOUNCE_DELAY);

        return () => {
            isMounted = false;
            window.clearTimeout(debounceTimerId);
        };
    }, [searchTerm]);
    return { books, setBooks, isLoading, errorMessage };
}