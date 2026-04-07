const rooms = new Map();

function subscribe(room, res) {
    if (!rooms.has(room)) rooms.set(room, new Set());
    rooms.get(room).add(res);
}

function unsubscribe(room, res) {
    const set = rooms.get(room);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) rooms.delete(room);
}

function emit(room, event, data) {
    const clients = rooms.get(room);
    if (!clients || clients.size === 0) return;

    const frame = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const res of clients) {
        try {
            res.write(frame);
        } catch (_err) {
            clients.delete(res);
        }
    }
}

function roomSize(room) {
    return rooms.get(room)?.size ?? 0;
}

module.exports = { subscribe, unsubscribe, emit, roomSize };