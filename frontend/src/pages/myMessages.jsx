import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";
import ChatListSection from "../components/Messages/ChatListSection";
import MessageComposer from "../components/Messages/MessageComposer";
import MessageThread from "../components/Messages/MessageThread";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const EMPTY_CHATS = {
  myBooks: [],
  theirBooks: [],
};

function MyMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedChatId = searchParams.get("chatId") || "";
  const [chats, setChats] = useState(EMPTY_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [composerText, setComposerText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const sortByRecent = useCallback((left, right) => {
    const leftTime = new Date(left.lastMessageAt || 0).getTime();
    const rightTime = new Date(right.lastMessageAt || 0).getTime();
    return rightTime - leftTime;
  }, []);

  const upsertChat = useCallback(
    (chatDto) => {
      if (!chatDto?.id) {
        return;
      }

      setChats((prev) => {
        const next = {
          myBooks: prev.myBooks.filter((chat) => chat.id !== chatDto.id),
          theirBooks: prev.theirBooks.filter((chat) => chat.id !== chatDto.id),
        };

        const sectionKey =
          chatDto.section === "theirBooks" ? "theirBooks" : "myBooks";
        next[sectionKey] = [chatDto, ...next[sectionKey]].sort(sortByRecent);
        return next;
      });
    },
    [sortByRecent],
  );

  const fetchChats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Could not load messages.");
        return;
      }

      const nextChats = {
        myBooks: Array.isArray(data.myBooks)
          ? data.myBooks.sort(sortByRecent)
          : [],
        theirBooks: Array.isArray(data.theirBooks)
          ? data.theirBooks.sort(sortByRecent)
          : [],
      };

      setChats(nextChats);

      const flattened = [...nextChats.myBooks, ...nextChats.theirBooks];
      if (flattened.length === 0) {
        setActiveChatId(null);
        return;
      }

      if (requestedChatId) {
        const requestedChatExists = flattened.some(
          (chat) => chat.id === requestedChatId,
        );
        if (requestedChatExists) {
          setActiveChatId(requestedChatId);
          return;
        }
      }

      const activeStillExists = flattened.some(
        (chat) => chat.id === activeChatId,
      );
      if (!activeStillExists) {
        setActiveChatId(flattened[0].id);
      }
    } catch (_error) {
      setErrorMessage("Could not load messages.");
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId, navigate, requestedChatId, sortByRecent]);

  useEffect(() => {
    fetchChats();

    const pollTimer = window.setInterval(fetchChats, 10000);
    return () => window.clearInterval(pollTimer);
  }, [fetchChats]);

  const activeChat = useMemo(() => {
    if (!activeChatId) {
      return null;
    }

    return [...chats.myBooks, ...chats.theirBooks].find(
      (chat) => chat.id === activeChatId,
    );
  }, [activeChatId, chats.myBooks, chats.theirBooks]);

  const formatTime = (timeValue) => {
    const timestamp = new Date(timeValue || 0).getTime();
    if (!timestamp) {
      return "Now";
    }

    const diffMs = Date.now() - timestamp;
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const sendToActiveChat = async () => {
    if (!activeChat) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    const text = composerText.trim();
    if (!text) {
      return;
    }

    setErrorMessage("");
    setIsSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chats/${activeChat.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.message || "Could not send message.");
        return;
      }

      setComposerText("");
      upsertChat(result);
    } catch (_error) {
      setErrorMessage("Could not send message.");
    } finally {
      setIsSending(false);
    }
  };

  const runBookAction = async (actionName) => {
    if (!activeChat) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    setErrorMessage("");
    setIsActionPending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chats/${activeChat.id}/${actionName}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Could not update this book.");
        return;
      }

      upsertChat(result);
    } catch (_error) {
      setErrorMessage("Could not update this book.");
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div>
      <Navbar isLoggedIn={true} />
      <Breadcrumbs
        items={[
          { label: "Home", to: "/home" },
          { label: "Profile", to: "/profile" },
          { label: "Messages" },
        ]}
      />

      <div style={styles.page}>
        <h1 style={styles.pageTitle}>My Messages</h1>

        {isLoading ? <p style={styles.meta}>Loading messages...</p> : null}

        <div style={styles.layout}>
          <aside style={styles.listColumn}>
            <ChatListSection
              label="My Books"
              sectionKey="myBooks"
              chats={chats.myBooks}
              activeChatId={activeChatId}
              onSelect={setActiveChatId}
              formatTime={formatTime}
            />
            <ChatListSection
              label="Their Books"
              sectionKey="theirBooks"
              chats={chats.theirBooks}
              activeChatId={activeChatId}
              onSelect={setActiveChatId}
              formatTime={formatTime}
            />
          </aside>

          <section style={styles.contentColumn}>
            {activeChat ? (
              <>
                <div style={styles.threadHeader}>
                  <div>
                    <h2 style={styles.threadTitle}>{activeChat.bookTitle}</h2>
                    <p style={styles.threadMeta}>
                      {activeChat.bookStatus === "available"
                        ? "Available"
                        : "Not Available"}
                    </p>
                  </div>

                  <div style={styles.headerActions}>
                    {activeChat.canLend ? (
                      <button
                        type="button"
                        style={styles.primaryAction}
                        disabled={isActionPending}
                        onClick={() => runBookAction("lend")}
                      >
                        Lend Book
                      </button>
                    ) : null}
                    {activeChat.canReturn ? (
                      <button
                        type="button"
                        style={styles.secondaryAction}
                        disabled={isActionPending}
                        onClick={() => runBookAction("return")}
                      >
                        Return Book
                      </button>
                    ) : null}
                  </div>
                </div>

                <MessageThread
                  messages={activeChat.messages || []}
                  emptyText="Start this conversation by sending a message."
                />

                <div style={styles.composerWrap}>
                  <MessageComposer
                    value={composerText}
                    onChange={setComposerText}
                    onSubmit={sendToActiveChat}
                    isSubmitting={isSending}
                    placeholder="Type your message..."
                    buttonLabel="Send"
                    disabled={!activeChat}
                  />
                </div>
              </>
            ) : (
              <p style={styles.meta}>
                Select a conversation to start messaging.
              </p>
            )}
          </section>
        </div>

        {errorMessage ? <p style={styles.error}>{errorMessage}</p> : null}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "30px 20px 34px",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 22px",
    color: "#000",
  },
  layout: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  listColumn: {
    flex: "1 1 300px",
    maxWidth: "360px",
    minWidth: "280px",
    padding: "14px",
    border: "1px solid #e4e7ec",
    borderRadius: "16px",
    backgroundColor: "#f9fafb",
  },
  contentColumn: {
    flex: "2 1 520px",
    minWidth: "300px",
    border: "1px solid #e4e7ec",
    borderRadius: "16px",
    backgroundColor: "#fff",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  threadHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
  },
  threadTitle: {
    margin: 0,
    fontSize: "1.15rem",
    color: "#111827",
  },
  threadMeta: {
    margin: "4px 0 0",
    fontSize: "0.85rem",
    color: "#667085",
  },
  headerActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  primaryAction: {
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#386f6d",
    color: "#fff",
    padding: "8px 12px",
    fontSize: "0.84rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryAction: {
    border: "1px solid #d0d5dd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    color: "#344054",
    padding: "8px 12px",
    fontSize: "0.84rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  composerWrap: {
    marginTop: "2px",
  },
  meta: {
    margin: "0 0 14px",
    color: "#667085",
    fontSize: "0.95rem",
  },
  error: {
    margin: "12px 0 0",
    color: "#b42318",
    fontSize: "0.92rem",
  },
};

export default MyMessages;
