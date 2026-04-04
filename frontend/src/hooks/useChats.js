import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getChats } from "../api/chats";

const POLL_INTERVAL = 10000; // TODO: migrate to websockets

const EMPTY_CHATS = {
    myBooks: [],
    theirBooks: [],
};

function sortByRecent(left, right) {
    const leftTime = new Date(left.lastMessage?.createdAt || 0).getTime();
    const rightTime = new Date(right.lastMessage?.createdAt || 0).getTime();
    return rightTime - leftTime;
}

export function useChats(requestedChatId = "") {
    const [chats, setChats] = useState(EMPTY_CHATS);
    const [activeChatId, setActiveChatId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const requestedChatIdRef = useRef(requestedChatId);
    const appliedRequestedChat = useRef(false);

    const updateInsertChat = useCallback((newChat) => {
        if (!newChat?.id) return;

        setChats((prev) => {
            const next = {
                myBooks: prev.myBooks.filter((chat) => chat.id !== newChat.id),
                theirBooks: prev.theirBooks.filter((chat) => chat.id !== newChat.id),
            };
            const sectionKey = newChat.section === "theirBooks" ? "theirBooks" : "myBooks";
            next[sectionKey] = [newChat, ...next[sectionKey]].sort(sortByRecent);
            return next;
        });
    }, []);

    const fetchChats = useCallback(async () => {
        try {
            const data = await getChats();

            const nextChats = {
                myBooks: Array.isArray(data.myBooks) ? [...data.myBooks].sort(sortByRecent) : [],
                theirBooks: Array.isArray(data.theirBooks) ? [...data.theirBooks].sort(sortByRecent) : [],
            };

            setChats(nextChats);

            const flattened = [...nextChats.myBooks, ...nextChats.theirBooks];
            if (flattened.length === 0) {
                setActiveChatId(null);
                return;
            }

            if (!appliedRequestedChat.current) {
                appliedRequestedChat.current = true;
                const requested = requestedChatIdRef.current;

                if (requested && flattened.some((chat) => chat.id === requested)) {
                    setActiveChatId(requested);
                    return;
                }
            }

            setActiveChatId((current) => {
                if (!current) return flattened[0].id;
                const stillExists = flattened.some((chat) => chat.id === current);
                return stillExists ? current : flattened[0].id;
            });
        } catch (error) {
            setErrorMessage("Could not load chats right now.");
            setChats(EMPTY_CHATS);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChats();

        const pollTimer = window.setInterval(fetchChats, POLL_INTERVAL);
        return () => window.clearInterval(pollTimer);
    }, [fetchChats]);

    const activeChat = useMemo(() => {
        if (!activeChatId) return null;

        return [...chats.myBooks, ...chats.theirBooks].find(
            (chat) => chat.id === activeChatId,
        );
    }, [activeChatId, chats]);

    return { chats, activeChatId, setActiveChatId, activeChat, isLoading, errorMessage, setErrorMessage, updateInsertChat };
}