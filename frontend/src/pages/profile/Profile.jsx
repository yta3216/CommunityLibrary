import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import avatar_placeholder from "../../resources/avatar_placeholder.png";
import Navbar from "../../components/Navbar/Navbar";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import BookCard from "../../components/BookCard/BookCard";
import BookForm from "../../components/BookForm";
import useProfileBooks from "../../hooks/useProfileBooks";
import "./Profile.css";
import Sidebar from "../../components/Sidebar/Sidebar";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const {
    ownedBooks,
    borrowedBooks,
    isLoading,
    errorMessage,
    selectedBookIdToEdit,
    setSelectedBookIdToEdit,
    selectedBookIdToDelete,
    setSelectedBookIdToDelete,
    editInitialValues,
    isEditOpen,
    setIsEditOpen,
    isDeletingBook,
    deleteMessage,
    clearDeleteMessage,
    deleteOwnedBook,
    editBook,
  } = useProfileBooks();

  const handleLogout = () => {
    signOut();
    window.location.assign("/");
  };

  const handleDeleteOwnedBook = useCallback(async () => {
    if (!selectedBookIdToDelete) return;

    const selectedBook = ownedBooks.find(
      (b) => b._id === selectedBookIdToDelete,
    );
    const confirmed = window.confirm(
      `Delete "${selectedBook?.title || "this book"}"?`,
    );
    if (!confirmed) return;

    await deleteOwnedBook(selectedBookIdToDelete);
  }, [deleteOwnedBook, ownedBooks, selectedBookIdToDelete]);

  const handleEditBook = useCallback(
    async (values) => {
      await editBook(selectedBookIdToEdit, values);
    },
    [editBook, selectedBookIdToEdit],
  );

  return (
    <>
      <Navbar
        onSearchClick={() => navigate("/home")}
        onSearchFocus={() => navigate("/home")}
      />
      <div className="sidebar-layout">
        <Sidebar />
        <div className="content">
          <Breadcrumbs
            items={[{ label: "Home", to: "/home" }, { label: "Profile" }]}
          />
          <div className="profile-container">
            <section className="profile-info">
              <div>
                <h1>Your Profile</h1>
                <p className="heading-md">
                  {user?.username || "Could not load username"}
                </p>
                <p className="text-muted-sm">
                  {user?.email || "Could not load email"}
                </p>
                <p className="text-muted-sm">
                  {user?.description || "Add a profile description."}
                </p>
                {errorMessage ? (
                  <p className="text-error">{errorMessage}</p>
                ) : null}
              </div>
              <div className="profile-meta">
                <img
                  src={user?.profileImageUrl || avatar_placeholder}
                  alt="Profile"
                  className="profile-pic-large"
                />
                <p className="text-muted-xs status-badge">
                  Status: {user?.status || "active"}
                </p>
              </div>
            </section>

            <div className="profile-actions">
              <Link to="/messages" className="button-secondary">
                My Messages
              </Link>
              <Link to="/profile/edit" className="button-secondary">
                Edit Profile
              </Link>
              <button
                type="button"
                className="button-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

            <section className="books-section">
              <h2>Owned Books</h2>

              {isLoading ? <p>Loading your books...</p> : null}

              {!isLoading && ownedBooks.length > 0 ? (
                <div className="book-action-panel">
                  <label htmlFor="edit-owned-book">
                    Edit one of your books:
                  </label>
                  <div className="book-action-controls">
                    <select
                      id="edit-owned-book"
                      value={selectedBookIdToEdit}
                      onChange={(e) => setSelectedBookIdToEdit(e.target.value)}
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
                      className="button-secondary"
                      disabled={!selectedBookIdToEdit || isEditOpen}
                      onClick={() => setIsEditOpen(true)}
                    >
                      Edit Book
                    </button>
                  </div>
                </div>
              ) : null}

              {!isLoading && ownedBooks.length > 0 ? (
                <div className="book-action-panel">
                  <label htmlFor="delete-owned-book">
                    Delete one of your books:
                  </label>
                  <div className="book-action-controls">
                    <select
                      id="delete-owned-book"
                      value={selectedBookIdToDelete}
                      onChange={(event) => {
                        setSelectedBookIdToDelete(event.target.value);
                        clearDeleteMessage();
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
                      className="button-secondary"
                      onClick={handleDeleteOwnedBook}
                      disabled={isDeletingBook || !selectedBookIdToDelete}
                    >
                      {isDeletingBook ? "Deleting..." : "Delete Book"}
                    </button>
                  </div>
                  {deleteMessage ? (
                    <p
                      className={
                        deleteMessage === "Book deleted."
                          ? "text-success"
                          : "text-error"
                      }
                    >
                      {deleteMessage}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {!isLoading && ownedBooks.length === 0 ? (
                <p>You don't own any books yet.</p>
              ) : (
                <div className="card-list">
                  {ownedBooks.map((book) => (
                    <BookCard
                      key={book._id}
                      title={book.title || "Untitled"}
                      author={book.author || "Unknown author"}
                      genre={book.genre || ""}
                      rating={book.avgReviews || 0}
                      onClick={() => navigate(`/book?id=${book._id}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="books-section">
              <h2>Borrowed Books</h2>
              {!isLoading && borrowedBooks.length === 0 ? (
                <p>You're not borrowing any books right now.</p>
              ) : (
                <div className="card-list">
                  {borrowedBooks.map((book) => (
                    <BookCard
                      key={book._id}
                      title={book.title || "Untitled"}
                      author={book.author || "Unknown author"}
                      genre={book.genre || ""}
                      rating={book.avgReviews || 0}
                      onClick={() => navigate(`/book?id=${book._id}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            {isEditOpen ? (
              <BookForm
                key={selectedBookIdToEdit}
                initialValues={editInitialValues}
                onSubmit={handleEditBook}
                onCancel={() => setIsEditOpen(false)}
                modalTitle="Edit Book Listing"
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
