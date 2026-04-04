import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteBook, updateBook } from "../api/books";
import Navbar from "../components/Navbar/Navbar";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";
import BookCard from "../components/BookCard/BookCard";
import avatar_placeholder from "../resources/avatar_placeholder.png";
import BookForm from "../components/BookForm";
import useBooks from "../hooks/useBooks";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [selectedBookIdToEdit, setSelectedBookIdToEdit] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBookIdToDelete, setSelectedBookIdToDelete] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeletingBook, setIsDeletingBook] = useState(false);

  const { books, setBooks, isLoading, errorMessage } = useBooks();

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

  const editInitialValues = useMemo(() => {
    const book = ownedBooks.find((b) => b._id === selectedBookIdToEdit) || ownedBooks[0];
    if (!book) return { isbn: "", title: "", author: "", genre: "", description: "" };
    return {
      isbn: String(book.isbn || ""),
      title: book.title || "",
      author: book.author || "",
      genre: book.genre || "",
      description: book.description || "",
    };
  }, [ownedBooks, selectedBookIdToEdit]);

  useEffect(() => {
    if (ownedBooks.length === 0) {
      setSelectedBookIdToEdit("");
      return;
    }
    const selectedStillExists = ownedBooks.some((b) => b._id === selectedBookIdToEdit);
    if (!selectedStillExists) {
      setSelectedBookIdToEdit(ownedBooks[0]._id);
    }
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
    signOut();
    window.location.assign("/");
  };

  const handleOpenBook = (bookId) => {
    navigate(`/book?id=${bookId}`);
  };

  const handleDeleteOwnedBook = async () => {
    if (!selectedBookIdToDelete) {
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

      await deleteBook(selectedBookIdToDelete);

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

  const handleEditBook = async (event) => {
    const result = await updateBook(selectedBookIdToEdit, event);
    setBooks((prev) => prev.map((book) => (book._id === result._id ? result : book)));
    setIsEditOpen(false);
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
              {user?.username || "Could not load username"}
            </p>
            <p style={styles.subtleText}>{user?.email || "Could not load email"}</p>
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
                  }}
                  disabled={isEditOpen}
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
                  disabled={!selectedBookIdToEdit || isEditOpen}
                  onClick={() => {
                    setIsEditOpen(true);
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
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3 className="modal-title">Edit Book Listing</h3>
              <BookForm
                key={selectedBookIdToEdit}
                initialValues={editInitialValues}
                onSubmit={handleEditBook}
                onCancel={() => setIsEditOpen(false)}
                submitLabel="Save Changes"
              />
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
};

export default Profile;
