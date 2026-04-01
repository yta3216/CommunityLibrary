import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";
import BookCard from "../components/BookCard/BookCard";
import avatar_placeholder from "../resources/avatar_placeholder.png";
import "./Profile.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBookIdToEdit, setSelectedBookIdToEdit] = useState("");
  const [editFormValues, setEditFormValues] = useState({
    isbn: "",
    title: "",
    author: "",
    genre: "",
    description: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [isUpdatingBook, setIsUpdatingBook] = useState(false);
  const [selectedBookIdToDelete, setSelectedBookIdToDelete] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeletingBook, setIsDeletingBook] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const [userResponse, booksResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/books`),
        ]);

        if (!userResponse.ok) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        const currentUser = await userResponse.json();
        const bookData = booksResponse.ok ? await booksResponse.json() : [];

        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        setBooks(Array.isArray(bookData) ? bookData : []);

        if (!booksResponse.ok) {
          setErrorMessage("Profile loaded, but books could not be fetched.");
        }
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage("Could not load your profile right now.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const ownedBooks = useMemo(() => {
    if (!user?._id) {
      return [];
    }

    return books.filter((book) => {
      const ownerId =
        typeof book.owner === "object" ? book.owner?._id : book.owner;
      return ownerId === user._id;
    });
  }, [books, user]);

  const borrowedBooks = useMemo(() => {
    if (!user?._id) {
      return [];
    }

    return books.filter((book) => {
      const holderId =
        typeof book.holder === "object" ? book.holder?._id : book.holder;
      const ownerId =
        typeof book.owner === "object" ? book.owner?._id : book.owner;
      return holderId === user._id && ownerId !== user._id;
    });
  }, [books, user]);

  useEffect(() => {
    if (ownedBooks.length === 0) {
      setSelectedBookIdToEdit("");
      setEditFormValues({
        isbn: "",
        title: "",
        author: "",
        genre: "",
        description: "",
      });
      return;
    }

    const targetBookId = selectedBookIdToEdit || ownedBooks[0]._id;
    const selectedBook = ownedBooks.find((book) => book._id === targetBookId);

    if (!selectedBook) {
      setSelectedBookIdToEdit(ownedBooks[0]._id);
      setEditFormValues({
        isbn: String(ownedBooks[0].isbn || ""),
        title: ownedBooks[0].title || "",
        author: ownedBooks[0].author || "",
        genre: ownedBooks[0].genre || "",
        description: ownedBooks[0].description || "",
      });
      return;
    }

    if (selectedBookIdToEdit !== targetBookId) {
      setSelectedBookIdToEdit(targetBookId);
    }

    setEditFormValues({
      isbn: String(selectedBook.isbn || ""),
      title: selectedBook.title || "",
      author: selectedBook.author || "",
      genre: selectedBook.genre || "",
      description: selectedBook.description || "",
    });
  }, [ownedBooks, selectedBookIdToEdit]);

  useEffect(() => {
    if (ownedBooks.length === 0) {
      setSelectedBookIdToDelete("");
      return;
    }

    if (!selectedBookIdToDelete) {
      setSelectedBookIdToDelete(ownedBooks[0]._id);
      return;
    }

    const selectedStillExists = ownedBooks.some(
      (book) => book._id === selectedBookIdToDelete,
    );

    if (!selectedStillExists) {
      setSelectedBookIdToDelete(ownedBooks[0]._id);
    }
  }, [ownedBooks, selectedBookIdToDelete]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.assign("/");
  };

  const handleOpenBook = (bookId) => {
    navigate(`/book?id=${bookId}`);
  };

  const handleDeleteOwnedBook = async () => {
    if (!selectedBookIdToDelete) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const selectedBook = ownedBooks.find(
      (book) => book._id === selectedBookIdToDelete,
    );

    const confirmDelete = window.confirm(
      `Delete "${selectedBook?.title || "this book"}"?`,
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeleteMessage("");
      setIsDeletingBook(true);

      const response = await fetch(
        `${API_BASE_URL}/api/books/${selectedBookIdToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDeleteMessage(result.message || "Could not delete this book.");
        return;
      }

      setBooks((previousBooks) =>
        previousBooks.filter((book) => book._id !== selectedBookIdToDelete),
      );
      setDeleteMessage("Book deleted.");
    } catch (_error) {
      setDeleteMessage("Could not delete this book right now.");
    } finally {
      setIsDeletingBook(false);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormValues((previous) => ({ ...previous, [name]: value }));
    setEditMessage("");
  };

  const getEditErrorMessage = (status, serverMessage) => {
    const normalizedServerMessage = String(serverMessage || "").toLowerCase();

    if (status === 400) {
      return "Invalid input. ISBN must be numeric and all fields are required.";
    }

    if (status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (status === 403) {
      return "You do not have permission to edit this book (owner only).";
    }

    if (status === 404) {
      if (normalizedServerMessage.includes("book not found")) {
        return "Book not found. It may have already been deleted.";
      }

      if (normalizedServerMessage.includes("cannot patch")) {
        return "Update endpoint was not found. Restart backend and confirm PATCH /api/books/:id is implemented.";
      }

      return "Update endpoint or target resource was not found. Please verify backend routes and restart the server.";
    }

    if (serverMessage) {
      return `Update failed: ${serverMessage}`;
    }

    return `Update failed (status: ${status}). Please try again shortly.`;
  };

  const handleEditOwnedBook = async (event) => {
    event.preventDefault();

    if (!selectedBookIdToEdit) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const payload = {
      isbn: editFormValues.isbn.trim(),
      title: editFormValues.title.trim(),
      author: editFormValues.author.trim(),
      genre: editFormValues.genre.trim(),
      description: editFormValues.description.trim(),
    };

    if (
      !payload.isbn ||
      Number.isNaN(Number(payload.isbn)) ||
      !payload.title ||
      !payload.author ||
      !payload.genre ||
      !payload.description
    ) {
      setEditMessage("ISBN and all fields are required.");
      return;
    }

    try {
      setEditMessage("");
      setIsUpdatingBook(true);

      const response = await fetch(
        `${API_BASE_URL}/api/books/${selectedBookIdToEdit}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setEditMessage(getEditErrorMessage(response.status, result.message));
        return;
      }

      setBooks((previousBooks) =>
        previousBooks.map((book) => (book._id === result._id ? result : book)),
      );
      setEditMessage("Book updated.");
    } catch (_error) {
      setEditMessage(
        "Could not reach the server. Please check that the backend is running.",
      );
    } finally {
      setIsUpdatingBook(false);
    }
  };

  return (
    <>
      <Navbar isLoggedIn={true} />
      <Breadcrumbs
        items={[{ label: "Home", to: "/home" }, { label: "Profile" }]}
      />
      <div className="profile-container">
        <section className="profile-info">
          <div>
            <h1>Your Profile</h1>
            <p style={styles.identityText}>
              {isLoading
                ? "Loading account..."
                : user
                  ? user.username
                  : "Could not load your account."}
            </p>
            <p style={styles.subtleText}>{user?.email || ""}</p>
            <p style={styles.subtleText}>
              {user?.description || "Profile description can be added later."}
            </p>
            {errorMessage ? (
              <p style={styles.errorText}>{errorMessage}</p>
            ) : null}
          </div>

          <div style={styles.profileMeta}>
            <img
              src={avatar_placeholder}
              alt="Profile"
              className="profile-pic-large"
            />
            <p style={styles.statusBadge}>Status: {user?.status || "active"}</p>
          </div>
        </section>

        <div className="profile-actions">
          <Link to="/messages" className="btn">
            My Messages
          </Link>
          <Link to="/profile/edit" className="btn">
            Edit Profile
          </Link>
          <button type="button" className="btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <section className="books-section">
          <h2>Owned Books</h2>
          {ownedBooks.length > 0 ? (
            <div className="book-delete-panel">
              <label htmlFor="edit-owned-book">Edit one of your books:</label>
              <div className="book-delete-controls">
                <select
                  id="edit-owned-book"
                  value={selectedBookIdToEdit}
                  onChange={(event) => {
                    setSelectedBookIdToEdit(event.target.value);
                    setEditMessage("");
                  }}
                  disabled={isUpdatingBook}
                >
                  {ownedBooks.map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title || "Untitled"} -{" "}
                      {book.author || "Unknown author"}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn"
                  disabled={!selectedBookIdToEdit || isUpdatingBook}
                  onClick={() => {
                    setIsEditOpen(true);
                    setEditMessage("");
                  }}
                >
                  Edit Book
                </button>
              </div>
            </div>
          ) : null}

          {ownedBooks.length > 0 ? (
            <div className="book-delete-panel">
              <label htmlFor="delete-owned-book">
                Delete one of your books:
              </label>
              <div className="book-delete-controls">
                <select
                  id="delete-owned-book"
                  value={selectedBookIdToDelete}
                  onChange={(event) => {
                    setSelectedBookIdToDelete(event.target.value);
                    setDeleteMessage("");
                  }}
                  disabled={isDeletingBook}
                >
                  {ownedBooks.map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title || "Untitled"} -{" "}
                      {book.author || "Unknown author"}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn"
                  onClick={handleDeleteOwnedBook}
                  disabled={isDeletingBook || !selectedBookIdToDelete}
                >
                  {isDeletingBook ? "Deleting..." : "Delete Book"}
                </button>
              </div>
              {deleteMessage ? (
                <p
                  style={
                    deleteMessage === "Book deleted."
                      ? styles.successText
                      : styles.errorText
                  }
                >
                  {deleteMessage}
                </p>
              ) : null}
            </div>
          ) : null}
          {ownedBooks.length === 0 ? (
            <p>You don't own any books yet.</p>
          ) : (
            <div className="card-list">
              {ownedBooks.map((book) => (
                <BookCard
                  key={book._id}
                  title={book.title || "Untitled"}
                  author={book.author || "Unknown author"}
                  genre={book.genre || ""}
                  rating={0}
                  onClick={() => handleOpenBook(book._id)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="books-section">
          <h2>Borrowed Books</h2>
          {borrowedBooks.length === 0 ? (
            <p>You're not borrowing any books right now.</p>
          ) : (
            <div className="card-list">
              {borrowedBooks.map((book) => (
                <BookCard
                  key={book._id}
                  title={book.title || "Untitled"}
                  author={book.author || "Unknown author"}
                  genre={book.genre || ""}
                  rating={0}
                  onClick={() => handleOpenBook(book._id)}
                />
              ))}
            </div>
          )}
        </section>

        {isEditOpen ? (
          <div style={styles.modalBackdrop}>
            <div style={styles.modalCard}>
              <h3 style={styles.modalTitle}>Edit Book Listing</h3>

              <form onSubmit={handleEditOwnedBook} style={styles.formGrid}>
                <label style={styles.inputLabel} htmlFor="edit-book-isbn">
                  ISBN
                </label>
                <input
                  id="edit-book-isbn"
                  name="isbn"
                  required
                  value={editFormValues.isbn}
                  onChange={handleEditChange}
                  style={styles.textInput}
                  placeholder="ISBN here"
                />

                <label style={styles.inputLabel} htmlFor="edit-book-title">
                  Title
                </label>
                <input
                  id="edit-book-title"
                  name="title"
                  required
                  value={editFormValues.title}
                  onChange={handleEditChange}
                  style={styles.textInput}
                  placeholder="Book title here"
                />

                <label style={styles.inputLabel} htmlFor="edit-book-author">
                  Author
                </label>
                <input
                  id="edit-book-author"
                  name="author"
                  required
                  value={editFormValues.author}
                  onChange={handleEditChange}
                  style={styles.textInput}
                  placeholder="Author name here"
                />

                <label style={styles.inputLabel} htmlFor="edit-book-genre">
                  Genre
                </label>
                <input
                  id="edit-book-genre"
                  name="genre"
                  required
                  value={editFormValues.genre}
                  onChange={handleEditChange}
                  style={styles.textInput}
                  placeholder="Genre here"
                />

                <label
                  style={styles.inputLabel}
                  htmlFor="edit-book-description"
                >
                  Description
                </label>
                <textarea
                  id="edit-book-description"
                  name="description"
                  required
                  value={editFormValues.description}
                  onChange={handleEditChange}
                  style={styles.textArea}
                  placeholder="Write a short description"
                />

                {editMessage ? (
                  <p
                    style={
                      editMessage === "Book updated."
                        ? styles.createSuccessText
                        : styles.createErrorText
                    }
                  >
                    {editMessage}
                  </p>
                ) : null}

                <div style={styles.modalButtonRow}>
                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={isUpdatingBook}
                  >
                    {isUpdatingBook ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => {
                      setIsEditOpen(false);
                      setEditMessage("");
                    }}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

const styles = {
  identityText: {
    margin: "0 0 8px",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#101828",
  },
  subtleText: {
    margin: "0 0 8px",
    color: "#475467",
  },
  errorText: {
    margin: "8px 0 0",
    color: "#b42318",
    fontWeight: 600,
  },
  successText: {
    margin: "8px 0 0",
    color: "#027a48",
    fontWeight: 600,
  },
  profileMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  statusBadge: {
    margin: 0,
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#eef2f6",
    color: "#344054",
    fontWeight: 600,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },
  modalCard: {
    width: "100%",
    maxWidth: "640px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 14px 32px rgba(0,0,0,0.22)",
  },
  modalTitle: {
    margin: "0 0 14px",
    fontSize: "24px",
    fontWeight: 700,
  },
  formGrid: {
    display: "grid",
    gap: "10px",
  },
  inputLabel: {
    fontSize: "14px",
    color: "#344054",
    fontWeight: 600,
  },
  textInput: {
    border: "1px solid #d0d5dd",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
  },
  textArea: {
    minHeight: "90px",
    border: "1px solid #d0d5dd",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    resize: "vertical",
  },
  createErrorText: {
    margin: 0,
    color: "#b42318",
    fontSize: "14px",
    fontWeight: 600,
  },
  createSuccessText: {
    margin: 0,
    color: "#166534",
    fontSize: "14px",
    fontWeight: 600,
  },
  modalButtonRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  primaryButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    fontWeight: 700,
    color: "#fff",
    backgroundColor: "#3d4a5c",
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #d0d5dd",
    borderRadius: "8px",
    padding: "10px 14px",
    fontWeight: 700,
    color: "#344054",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
};

export default Profile;
