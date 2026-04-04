import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";
import ChatListSection from "../components/Messages/ChatListSection";
import MessageComposer from "../components/Messages/MessageComposer";
import MessageThread from "../components/Messages/MessageThread";
import { lendBook, returnBorrowedBook, sendChatMessage } from "../api/chats";
import { useChats } from "../hooks/useChats";

function Messages() {
  const [searchParams] = useSearchParams();
  const requestedChatId = searchParams.get("chatId") || "";
  const [composerText, setComposerText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const { chats, activeChatId, setActiveChatId, activeChat, isLoading, errorMessage, setErrorMessage, updateInsertChat } = useChats(requestedChatId);

  const sendToActiveChat = async () => {
    if (!activeChat) {
      return;
    }

    const text = composerText.trim();
    if (!text) {
      return;
    }

    setErrorMessage("");
    setIsSending(true);

    try {
      const result = await sendChatMessage(activeChat.id, text);

      setComposerText("");
      updateInsertChat(result);
    } catch (_error) {
      setErrorMessage(_error?.message || "Could not send message.");
    } finally {
      setIsSending(false);
    }
  };
  const runBookAction = async (action) => {
    if (!activeChat) return;

    setErrorMessage("");
    setIsActionPending(true);

    try {
      const result = await action();
      updateInsertChat(result);
    } catch (_error) {
      setErrorMessage(_error?.message || "Could not update this book.");
    } finally {
      setIsActionPending(false);
    }
  };
  const handleLend = async () => runBookAction(() => lendBook(activeChat.id));
  const handleReturn = async () => runBookAction(() => returnBorrowedBook(activeChat.id));
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
          <section style={styles.listColumn}>
            <ChatListSection
              label="My Books"
              sectionKey="myBooks"
              chats={chats.myBooks}
              activeChatId={activeChatId}
              onSelect={setActiveChatId}
            />
            <ChatListSection
              label="Their Books"
              sectionKey="theirBooks"
              chats={chats.theirBooks}
              activeChatId={activeChatId}
              onSelect={setActiveChatId}
            />
          </section>

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
                        className="button-primary"
                        disabled={isActionPending}
                        onClick={handleLend}
                      >
                        Lend Book
                      </button>
                    ) : null}
                    {activeChat.canReturn ? (
                      <button
                        type="button"
                        className="button-secondary"
                        disabled={isActionPending}
                        onClick={handleReturn}
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

                <MessageComposer
                  value={composerText}
                  onChange={setComposerText}
                  onSubmit={sendToActiveChat}
                  isSubmitting={isSending}
                  placeholder="Type your message..."
                  buttonLabel="Send"
                  disabled={!activeChat}
                />
              </>
            ) : (
              <p style={styles.meta}>
                Select a conversation to start messaging.
              </p>
            )}
          </section>
        </div>

        {errorMessage ? <p className="text-error">{errorMessage}</p> : null}
      </div>
    </div>
  );
}
// TODO: Fix styling and also extract them into index.css or something.
const styles = {
  page: {
    maxWidth: "1180px",
    margin: "0",
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
    maxHeight: "600px",
    height: "auto",
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
    maxHeight: "600px",
    overflow: "scroll",
  },
  threadHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
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
  composerWrap: {
    marginTop: "2px",
  },
  meta: {
    margin: "0 0 14px",
    color: "#667085",
    fontSize: "0.95rem",
  },
};

export default Messages;
