import React from "react";
import "./BookCard.css";

const BookCard = ({ title, author, genre, availabilityLabel, rating, onClick }) => {
  return (
    <div
      className="book-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="book-card-bg"></div>
      <div className="book-card-content">
        <h3>{title}</h3>
        <p className="author">by {author}</p>
        <p className="genre">Genre: {genre}</p>
        {availabilityLabel ? (
          <p className="availability">{availabilityLabel}</p>
        ) : null}
        <div className="stars">
          {Array.from({ length: 5 }).map((_, i) =>
            i < rating ? (
              <span key={i} style={{ color: "#FFD700" }}>
                ★
              </span>
            ) : (
              <span key={i} style={{ color: "#ccc" }}>
                ☆
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
