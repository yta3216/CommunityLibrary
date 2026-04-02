import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../resources/logo.png";
import { useAuth } from "../context/AuthContext";
import { deleteUser, getUsers, toggleUserStatus, cycleUserRole } from "../api/users";
import { getBooks } from "../api/books";
import "./adminPages.css";

export default function AdminUsers() {
  const { user: currentUser, signOut } = useAuth();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");

  const loadAdminUsersPage = useCallback(async (isMountedRef) => {
    try {
      setIsLoading(true);

      const [usersData, booksData] = await Promise.all([
        getUsers(),
        getBooks(),
      ]);

      if (!isMountedRef()) {
        return;
      }

      setUsers(Array.isArray(usersData) ? usersData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (_error) {
      if (isMountedRef()) {
        alert(_error?.message || "Could not reach server.");
      }
    } finally {
      if (isMountedRef()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadAdminUsersPage(() => isMounted);

    return () => {
      isMounted = false;
    };
  }, [loadAdminUsersPage]);

  const handleLogout = () => {
    signOut();
    window.location.assign("/login");
  };

  const handleCycleRole = async (userId) => {
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

  const handleToggleStatus = async (userId) => {
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

  const handleDeleteUser = async (userId) => {
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
      alert("User deleted.");
    } catch (_error) {
      alert(_error?.message || "Could not reach server.");
    } finally {
      setIsActing(false);
    }
  };

  const userRows = useMemo(() => {
    return users.map((user) => {
      const userId = user._id;

      const listings = books.filter((book) => {
        const ownerId =
          typeof book.owner === "object" ? book.owner?._id : book.owner;
        return ownerId === userId;
      }).length;

      const borrowed = books.filter((book) => {
        const ownerId =
          typeof book.owner === "object" ? book.owner?._id : book.owner;
        const holderId =
          typeof book.holder === "object" ? book.holder?._id : book.holder;
        return holderId === userId && ownerId !== userId;
      }).length;

      return {
        id: user._id,
        username: user.username || "",
        displayUsername: user.username || "Unknown user",
        email: user.email || "",
        role: user.role || "user",
        status: user.status || "active",
        borrowed,
        listings,
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
          : String(user.username).toLowerCase().includes(normalizedQuery);

      return matchesUserType && matchesUserSearch;
    });
  }, [userSearch, userRows, userTypeFilter]);

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <img
            src={logo}
            alt="Community Library logo"
            style={{ width: 42, height: 42, objectFit: "contain" }}
          />
          <nav className="admin-nav">
            <NavLink
              to="/admin/home"
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " active" : ""}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/admin/books"
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " active" : ""}`
              }
            >
              Books
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " active" : ""}`
              }
            >
              Users
            </NavLink>
          </nav>
          <div className="admin-topbar-right">
            <span className="admin-chip">
              {currentUser?.username || "Admin"}
            </span>
            <button
              type="button"
              className="admin-chip admin-link"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </header>

        <div className="admin-divider" />

        <h1 className="admin-title">Manage Users</h1>
        <p className="admin-subtitle">
          Admin view of users. Toggle status, change role or delete a user. Be
          careful with this page!
        </p>

        <section className="admin-card">
          <div className="admin-row">
            <div>
              <h2 className="admin-card-title">Users</h2>
              <p className="admin-card-note">
                {isLoading ? "Loading users..." : "Live data"}
              </p>
            </div>
          </div>

          <div className="admin-filters">
            <input
              className="admin-input"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search username..."
            />
            <select
              className="admin-select"
              value={userTypeFilter}
              onChange={(event) => setUserTypeFilter(event.target.value)}
            >
              <option value="all">All</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </section>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Borrowed</th>
                <th>Listings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUserRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-card-note">
                    No users match this filter.
                  </td>
                </tr>
              ) : (
                filteredUserRows.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.displayUsername}</strong>
                      <div className="admin-card-note">
                        {user.email} • {user.id}
                      </div>
                    </td>
                    <td>
                      <span className="admin-pill">
                        {String(user.role).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="admin-pill">
                        {String(user.status).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <strong>{user.borrowed}</strong>
                    </td>
                    <td>
                      <strong>{user.listings}</strong>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-button light"
                          disabled={isActing}
                          onClick={() => handleCycleRole(user.id)}
                        >
                          Cycle Role
                        </button>
                        <button
                          type="button"
                          className="admin-button light"
                          disabled={isActing}
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          Toggle Status
                        </button>
                        <button
                          type="button"
                          className="admin-button light"
                          disabled={isActing}
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
