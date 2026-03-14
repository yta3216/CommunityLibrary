import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../resources/logo.png";
import "./adminPages.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5050";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAdminUsersPage = async (token, isMountedRef) => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const [meResponse, usersResponse, booksResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/users`),
        fetch(`${API_BASE_URL}/api/books`),
      ]);

      if (!meResponse.ok) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      const meData = await meResponse.json();
      const usersData = usersResponse.ok ? await usersResponse.json() : [];
      const booksData = booksResponse.ok ? await booksResponse.json() : [];

      if (!isMountedRef()) {
        return;
      }

      setCurrentUser(meData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);

      if (!usersResponse.ok || !booksResponse.ok) {
        setErrorMessage("Could not load all admin data.");
      }
    } catch (_error) {
      if (isMountedRef()) {
        setErrorMessage("Could not reach server.");
      }
    } finally {
      if (isMountedRef()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    loadAdminUsersPage(token, () => isMounted);

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.assign("/login");
  };

  const handleCycleRole = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    setIsActing(true);
    setErrorMessage("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/cycle-role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Could not cycle role.");
        return;
      }

      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? result : user)),
      );
    } catch (_error) {
      setErrorMessage("Could not reach server.");
    } finally {
      setIsActing(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    setIsActing(true);
    setErrorMessage("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Could not toggle status.");
        return;
      }

      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? result : user)),
      );
    } catch (_error) {
      setErrorMessage("Could not reach server.");
    } finally {
      setIsActing(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    setIsActing(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message || "Could not delete user.");
        return;
      }

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
    } catch (_error) {
      setErrorMessage("Could not reach server.");
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
        name: user.name || user.username || "Unknown user",
        email: user.email || "",
        role: user.role || "user",
        status: user.status || "active",
        borrowed,
        listings,
      };
    });
  }, [books, users]);

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
          <input
            className="admin-search"
            placeholder="Search users, email, role..."
          />
          <span className="admin-chip">
            {currentUser?.name || currentUser?.username || "Admin"}
          </span>
          <button
            type="button"
            className="admin-chip admin-link"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </header>

        <div className="admin-divider" />

        <h1 className="admin-title">Manage Users</h1>
        <p className="admin-subtitle">
          Admin view of users. Toggle status, change role (UI only). Later
          connect to authentication + database.
        </p>

        {errorMessage ? (
          <p className="admin-card-note">{errorMessage}</p>
        ) : null}

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
            <input className="admin-input" placeholder="Name, email, role..." />
            <select className="admin-select" defaultValue="All">
              <option>All</option>
              <option>Admin</option>
              <option>Verified</option>
              <option>User</option>
            </select>
            <select className="admin-select" defaultValue="All">
              <option>All</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
            <div className="admin-actions">
              <button type="button" className="admin-button light">
                Clear
              </button>
              <button type="button" className="admin-button">
                Apply
              </button>
            </div>
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
              {userRows.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
