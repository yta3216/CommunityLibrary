import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteUser, getUsers, toggleUserStatus, cycleUserRole } from "../../api/users";
import { getBooks, deleteBook} from "../../api/books";
import { deleteReview } from "../../api/reviews";
import UserDetailPanel from "./UserDetailPanel";
import AdminLayout from "./AdminLayout";
import "./AdminPages.css";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsers() {
  const {user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [expandedUserId, setExpandedUserId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersData, booksData] = await Promise.all([getUsers(), getBooks()]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (_error) {
      alert(_error?.message || "Could not reach server.");
    } finally {
      setIsLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleExpand = (userId) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  const handleCycleRole = async (userId, currentRole) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Change this user's role to "${nextRole}"?`)) return;
    setIsActing(true);
    try {
      const result = await cycleUserRole(userId);

      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? result : user)),
      );
      alert("User role updated.");
    } catch (_error) {
      alert(_error?.message || "Could not reach server.");
    } finally {
      setIsActing(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus === "active" ? "suspend" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    setIsActing(true);
    try {
      const result = await toggleUserStatus(userId);

      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? result : user)),
      );
      alert("User status updated.");
    } catch (_error) {
      alert(_error?.message || "Could not reach server.");
    } finally {
      setIsActing(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Delete "${username}"? This will also permanently delete all their book listings. This cannot be undone.`)) return;

    setIsActing(true);
    try {
      await deleteUser(userId);

      setUsers((prev) => prev.filter((user) => user._id !== userId));
      setBooks((prev) =>
        prev.filter((book) => {
          const ownerId =
            typeof book.owner === "object" ? book.owner?._id : book.owner;
          const holderId =
            typeof book.holder === "object" ? book.holder?._id : book.holder;
          return ownerId !== userId && holderId !== userId;
        }),
      );
      if (expandedUserId === userId) setExpandedUserId(null);
      alert("User deleted.");
    } catch (_error) {
      alert(_error?.message || "Could not reach server.");
    } finally {
      setIsActing(false);
    }
  };

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteBook(bookId);
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      alert("Book deleted.");
    } catch (_error) {
      alert(_error?.message || "Could not delete book.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    try {
      await deleteReview(reviewId);
      alert("Review deleted.");
    } catch (_error) {
      alert(_error?.message || "Could not delete review.");
    }
  };

  const userRows = useMemo(() => {
    return users.map((user) => {
      const userId = user._id;

      const ownedBooks = books.filter((book) => {
        const ownerId =
          typeof book.owner === "object" ? book.owner?._id : book.owner;
        return ownerId === userId;
      });

      const borrowedBooks = books.filter((book) => {
        const ownerId =
          typeof book.owner === "object" ? book.owner?._id : book.owner;
        const holderId =
          typeof book.holder === "object" ? book.holder?._id : book.holder;
        return holderId === userId && ownerId !== userId;
      });

      const bookTitles = ownedBooks.map((b) => String(b.title || "").toLowerCase());

      return {
        id: user._id,
        username: user.username || "",
        displayUsername: user.username || "Unknown user",
        email: user.email || "",
        role: user.role || "user",
        status: user.status || "active",
        ownedBooks,
        borrowedBooks,
        bookTitles,
        reviewCount: user.reviewCount || 0,
      };
    });
  }, [books, users]);

  const filteredUserRows = useMemo(() => {
    const normalizedQuery = userSearch.trim().toLowerCase();

    return userRows.filter((user) => {
      const matchesUserType =
        userTypeFilter === "all"
          ? true
          : String(user.role).toLowerCase() === userTypeFilter;

      const matchesUserSearch =
        normalizedQuery.length === 0
          ? true
          : String(user.username).toLowerCase().includes(normalizedQuery)||
            String(user.email).toLowerCase().includes(normalizedQuery) ||
            user.bookTitles.some((title) => title.includes(normalizedQuery));

      return matchesUserType && matchesUserSearch;
    });
  }, [userSearch, userRows, userTypeFilter]);

  return (
    <AdminLayout>
      <h1 className="heading-lg">Manage Users</h1>
      <p className="text-muted-sm admin-subtitle">
        Search, suspend, promote, or remove users. Click a row to see their activity.
      </p>

      <section className="admin-card">
        <div className="admin-row">
          <div>
            <h2 className="heading-md">Users</h2>
            <p className="text-muted-xs admin-card-note">
              {isLoading ? "Loading users..." : `${filteredUserRows.length} user(s) shown`}
            </p>
          </div>
        </div>

        <div className="admin-filters">
          <input
            className="admin-input"
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder="Search by username or email..."
          />
          <select
            className="admin-select"
            value={userTypeFilter}
            onChange={(event) => setUserTypeFilter(event.target.value)}
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </section>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Borrowed</th>
              <th>Listings</th>
              <th>Reviews</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUserRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-muted-xs admin-card-note">
                  No users match this filter.
                </td>
              </tr>
            ) : (
              filteredUserRows.flatMap((user) => {
                const isExpanded = expandedUserId === user.id;
                return [
                <tr
                  key={user.id}
                  className={`admin-user-row${isExpanded ? " expanded" : ""}`}
                  onClick={() => handleToggleExpand(user.id)}
                >
                  <td className="admin-expand-cell">
                    <span className="admin-expand-icon">
                        {isExpanded ? "▾" : "▸"}
                      </span>
                    </td>
                    <td>
                      <strong>{user.displayUsername}</strong>
                      {currentUser?._id === user.id && (
                        <span className="admin-pill admin-pill-you"> You</span>
                      )}
                      <div className="text-muted-xs admin-card-note">{user.email}</div>
                  </td>
                  <td>
                    <span className={`admin-pill ${user.role === "admin" ? "admin-pill-admin" : "admin-pill-user"}`}>
                      {String(user.role).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-pill ${user.status === "suspended" ? "admin-pill-suspended" : "admin-pill-active"}`}>
                      {String(user.status).toUpperCase()}
                    </span>
                  </td>
                  <td><strong>{user.borrowedBooks.length}</strong></td>
                  <td>
                    <strong>{user.ownedBooks.length}</strong>
                  </td>
                  <td><strong>{user.reviewCount}</strong></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className={`admin-button ${user.role === "admin" ? "admin-button-blue" : "admin-button-purple"}`}
                        disabled={isActing}
                        onClick={() => handleCycleRole(user.id, user.role)}
                      >
                        {user.role === "admin" ? "Make User" : "Make Admin"}
                      </button>
                      <button
                        type="button"
                        className={`admin-button ${user.status === "active" ? "admin-button-warning" : "admin-button-success"}`}
                        disabled={isActing}
                        onClick={() => handleToggleStatus(user.id, user.status)}
                      >
                        {user.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="admin-button admin-button-danger"
                        disabled={isActing || currentUser?._id === user.id}
                        onClick={() => handleDeleteUser(user.id, user.displayUsername)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>,

                  isExpanded && (
                    <tr key={`${user.id}-detail`} className="admin-detail-row">
                      <td colSpan={8} className="admin-detail-cell">
                        <UserDetailPanel
                          user={user}
                          ownedBooks={user.ownedBooks}
                          borrowedBooks={user.borrowedBooks}
                          onDeleteBook={handleDeleteBook}
                          onDeleteReview={handleDeleteReview}
                        />
                      </td>
                    </tr>
                  ),
                ].filter(Boolean);
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}