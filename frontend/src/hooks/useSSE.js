import { useEffect, useRef } from "react";
import { createEventSource } from "../api/client";

const SSE_EVENTS = [
    "book:created",
    "book:updated",
    "book:deleted",
    "review:created",
    "review:deleted",
    "chat:updated",
    "user:suspended",
    "user:updated",
];

export function useSSE(rooms, handlers) {
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    const roomsKey = rooms.join(",");

    useEffect(() => {
        if (!roomsKey) return;

        const es = createEventSource(rooms);

        for (const event of SSE_EVENTS) {
            es.addEventListener(event, (e) => {
                const handler = handlersRef.current?.[event];
                if (!handler) return;
                try {
                    handler(JSON.parse(e.data));
                } catch (_err) { }
            });
        }

        return () => es.close();
    }, [roomsKey]);
}