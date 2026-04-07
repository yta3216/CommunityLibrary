import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../resources/logo.png";
import "./AdminPages.css";

export default function AdminLayout({ children }) {
    const { user: currentUser, signOut } = useAuth();

    const handleLogout = () => {
        signOut();
        window.location.assign("/login");
    };

    return (
        <div className="admin-page">
            <div className="admin-shell">
                <header className="admin-topbar">
                    <img
                        src={logo}
                        alt="Community Library logo"
                        className="admin-logo"
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
                        <NavLink
                            to="/admin/reports"
                            className={({ isActive }) =>
                                `admin-nav-link${isActive ? " active" : ""}`
                            }
                        >
                            Reports
                        </NavLink>
                    </nav>
                    <div className="admin-topbar-right">
                        <span className="admin-chip">
                            {currentUser?.username || "Admin"}
                        </span>
                        <button
                            type="button"
                            className="admin-chip admin-logout"
                            onClick={handleLogout}
                        >
                            Log Out
                        </button>
                    </div>
                </header>

                <div className="admin-divider" />

                {children}
            </div>
        </div>
    );
}