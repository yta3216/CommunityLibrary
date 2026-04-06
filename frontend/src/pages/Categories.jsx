import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs/Breadcrumbs";
import useBooks from "../hooks/useBooks";
import "./Categories.css";

const extractPrimaryGenre = (genreValue) => {
  const normalized = String(genreValue || "").trim();
  if (!normalized) {
    return "";
  }

  // if multiple genres are ever stored in one field, keep only the first one
  return normalized.split(",")[0].trim();
};

const startsWithLetter = (value) => /^[A-Za-z]/.test(value);

function Categories() {
  const navigate = useNavigate();
  const { books, isLoading, errorMessage } = useBooks();

  const genresWithBooks = useMemo(() => {
    const grouped = new Map();

    books.forEach((book) => {
      const primaryGenre = extractPrimaryGenre(book?.genre);
      const key = startsWithLetter(primaryGenre) ? primaryGenre : "Other";

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key).push(book);
    });

    return Array.from(grouped.entries())
      .sort(([leftGenre], [rightGenre]) => {
        if (leftGenre === "Other") {
          return 1;
        }
        if (rightGenre === "Other") {
          return -1;
        }
        return leftGenre.localeCompare(rightGenre);
      })
      .map(([genre, genreBooks]) => ({
        genre,
        books: genreBooks.sort((leftBook, rightBook) =>
          String(leftBook?.title || "").localeCompare(
            String(rightBook?.title || ""),
          ),
        ),
      }));
  }, [books]);

  return (
    <div>
      <Navbar
        onSearchClick={() => navigate("/home")}
        onSearchFocus={() => navigate("/home")}
      />
      <div className="sidebar-layout">
        <Sidebar />
        <main className="content">
          <Breadcrumbs
            items={[{ label: "Home", to: "/home" }, { label: "Categories" }]}
          />

          <div className="categories-heading-row">
            <span className="categories-accent" aria-hidden="true" />
            <h2 className="heading-lg">Categories</h2>
          </div>

          {isLoading ? (
            <p className="text-muted-sm">Loading categories...</p>
          ) : null}

          {!isLoading && errorMessage ? (
            <p className="text-error">{errorMessage}</p>
          ) : null}

          {!isLoading && !errorMessage && genresWithBooks.length === 0 ? (
            <p className="text-muted-sm">No categories found.</p>
          ) : null}

          {!isLoading && !errorMessage
            ? genresWithBooks.map((group) => (
              <details key={group.genre} className="categories-panel" open>
                <summary className="categories-summary">
                  <span>{group.genre}</span>
                  <span className="categories-count">{group.books.length}</span>
                </summary>

                <ul className="categories-book-list">
                  {group.books.map((book) => (
                    <li key={book._id}>
                      <button
                        type="button"
                        className="categories-book-button"
                        onClick={() => navigate(`/book?id=${book._id}`)}
                      >
                        <span className="categories-book-title">
                          {book.title || "Untitled"}
                        </span>
                        <span className="text-muted-sm">
                          {book.author || "Unknown author"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            ))
            : null}
        </main>
      </div>
    </div>
  );
}

export default Categories;