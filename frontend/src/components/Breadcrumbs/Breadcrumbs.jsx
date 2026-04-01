import { Link } from "react-router-dom";
import "./Breadcrumbs.css";

function Breadcrumbs({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="breadcrumbs-item">
              {!isLast && item.to ? (
                <Link to={item.to} className="breadcrumbs-link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumbs-current" aria-current="page">
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <span className="breadcrumbs-separator">/</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
