import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
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

  return (
    <>
      <Navbar isLoggedIn={true} />
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
};

export default Profile;
