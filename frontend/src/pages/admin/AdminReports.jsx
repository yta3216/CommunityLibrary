import { useCallback, useEffect, useState } from "react";
import { getUsers } from "../../api/users";
import { getBooks } from "../../api/books";
import { getAllReviews } from "../../api/reviews";
import Alert from "../../components/Alert/Alert";
import AdminLayout from "./AdminLayout";
import SignupsChart from "./charts/SignupsChart";
import ReviewsChart from "./charts/ReviewsChart";
import ListingsChart from "./charts/ListingsChart";
import "./AdminPages.css";

const DATE_FILTERS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export default function AdminReports() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersData, booksData, reviewsData] = await Promise.all([
        getUsers(),
        getBooks(),
        getAllReviews(),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (_error) {
      setAlertMessage(_error?.message || "Could not load report data.");
      setAlertType("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cutoff = Date.now() - selectedDays * 24 * 60 * 60 * 1000;

  const getTime = (doc) => {
    if (doc.createdAt) return new Date(doc.createdAt).getTime();
    return parseInt(String(doc._id).substring(0, 8), 16) * 1000;
  };

  const newUsers = users.filter((u) => getTime(u) >= cutoff).length;
  const newBooks = books.filter((b) => getTime(b) >= cutoff).length;
  const newReviews = reviews.filter(
    (r) => new Date(r.createdAt).getTime() >= cutoff
  ).length;

  return (
    <AdminLayout>
      <Alert
        message={alertMessage}
        type={alertType}
        onDismiss={() => setAlertMessage("")}
      />
      <h1 className="heading-lg">Usage Reports</h1>
      <p className="text-muted-sm admin-subtitle">
        Activity overview for the selected time period.
      </p>

      <section className="admin-card stack-space-sm">
        <div className="admin-row">
          <h2 className="heading-md">Filter by period</h2>
          <div className="admin-filter-pills">
            {DATE_FILTERS.map((f) => (
              <button
                key={f.days}
                type="button"
                className={selectedDays === f.days ? "button-primary" : "button-secondary"}
                onClick={() => setSelectedDays(f.days)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-metrics stack-space-sm">
        <div className="admin-card">
          <p className="text-muted-xs admin-card-note">New Sign-ups</p>
          <p className="admin-metric-value">{isLoading ? "—" : newUsers}</p>
          <p className="text-muted-xs admin-card-note">
            In the last {selectedDays} days
          </p>
        </div>
        <div className="admin-card">
          <p className="text-muted-xs admin-card-note">New Listings</p>
          <p className="admin-metric-value">{isLoading ? "—" : newBooks}</p>
          <p className="text-muted-xs admin-card-note">
            In the last {selectedDays} days
          </p>
        </div>
        <div className="admin-card">
          <p className="text-muted-xs admin-card-note">New Reviews</p>
          <p className="admin-metric-value">{isLoading ? "—" : newReviews}</p>
          <p className="text-muted-xs admin-card-note">
            In the last {selectedDays} days
          </p>
        </div>
        <div className="admin-card">
          <p className="text-muted-xs admin-card-note">Total Users</p>
          <p className="admin-metric-value">{isLoading ? "—" : users.length}</p>
          <p className="text-muted-xs admin-card-note">All time</p>
        </div>
      </section>

      {!isLoading && (
        <section className="admin-grid-3">
          <SignupsChart users={users} days={selectedDays} />
          <ListingsChart books={books} days={selectedDays} />
          <ReviewsChart reviews={reviews} days={selectedDays} />
        </section>
      )}

      {isLoading && (
        <p className="text-muted-xs admin-card-note">Loading report data...</p>
      )}
    </AdminLayout>
  );
}