import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";
import ChatListSection from "../components/Messages/ChatListSection";
import MessageComposer from "../components/Messages/MessageComposer";
import MessageThread from "../components/Messages/MessageThread";
import { useChats } from "../hooks/useChats";
import "./Messages.css";
import Sidebar from "../components/Sidebar/Sidebar";

function Messages() {
  const [searchParams] = useSearchParams();
  const requestedChatId = searchParams.get("chatId") || "";
  const [composerText, setComposerText] = useState("");

  const { chats, activeChatId, setActiveChatId, activeChat, isLoading, errorMessage, isSending, isActionPending, sendMessage, lendOwnedBook, returnBook } = useChats(requestedChatId);

  const handleSend = async () => {
    const ok = await sendMessage(composerText);
    if (ok) setComposerText("");
  };

  return (
    <div>
      <Navbar isLoggedIn={true} />
      <div className="sidebar-layout">
        <Sidebar isLoggedIn={true} />
        <div className="content">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/home" },
              { label: "Profile", to: "/profile" },
              { label: "Messages" },
            ]}
          />
          <div className="messages-page">
            <h1 className="heading-lg">My Messages</h1>

            {isLoading ? <p className="text-muted-sm">Loading messages...</p> : null}

            <div className="messages-layout">
              <section className="messages-list-column">
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

              <section className="messages-content-column">
                {activeChat ? (
                  <>
                    <div className="messages-thread-header">
                      <div>
                        <h2 className="messages-thread-title">{activeChat.bookTitle}</h2>
                        <p className="text-muted-xs">
                          {activeChat.bookStatus === "available" ? "Available" : "Not Available"}
                        </p>
                      </div>

                      <div className="messages-header-actions">
                        {activeChat.canLend ? (
                          <button
                            type="button"
                            className="button-primary"
                            disabled={isActionPending}
                            onClick={lendOwnedBook}
                          >
                            Lend Book
                          </button>
                        ) : null}
                        {activeChat.canReturn ? (
                          <button
                            type="button"
                            className="button-secondary"
                            disabled={isActionPending}
                            onClick={returnBook}
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
                      onSubmit={handleSend}
                      isSubmitting={isSending}
                      placeholder="Type your message..."
                      buttonLabel="Send"
                      disabled={!activeChat}
                    />
                  </>
                ) : (
                  <p className="text-muted-sm">Select a conversation to start messaging.</p>
                )}
              </section>
            </div>

            {errorMessage ? <p className="text-error">{errorMessage}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
