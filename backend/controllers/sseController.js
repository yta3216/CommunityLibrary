const { subscribe, unsubscribe } = require("../sseManager");

const ALLOWED_PREFIXES = ["books", "book:", "chats", "user:"];

function isAllowedRoom(room) {
    return ALLOWED_PREFIXES.some((p) => room === p || room.startsWith(p));
}

function resolveRooms(requestedRooms, userId) {
    return requestedRooms
        .filter(isAllowedRoom)
        .filter((r) => {
            if (r.startsWith("user:")) return r === `user:${userId}`;
            return true;
        })
        .map((r) => (r === "chats" ? `chat:${userId}` : r));
}

function parseRoomsParam(roomsQuery) {
    return String(roomsQuery || "")
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
}

const connect = (req, res) => {
    const requested = parseRoomsParam(req.query.rooms);
    const resolved = resolveRooms(requested, req.user.id);

    if (resolved.length === 0) {
        return res.status(400).json({ message: "no valid rooms requested" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "http://localhost:3000");
    res.flushHeaders();

    for (const room of resolved) subscribe(room, res);

    res.write(
        `event: connected\ndata: ${JSON.stringify({ rooms: resolved })}\n\n`
    );

    const heartbeat = setInterval(() => {
        try {
            res.write(": heartbeat\n\n");
        } catch (_err) {
            clearInterval(heartbeat);
        }
    }, 25000);

    req.on("close", () => {
        clearInterval(heartbeat);
        for (const room of resolved) unsubscribe(room, res);
    });
};

module.exports = { connect };