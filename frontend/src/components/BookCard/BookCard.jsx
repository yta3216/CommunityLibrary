import React from "react";
import "./BookCard.css";

const BookCard = ({ title, author, owner, genre, rating, createdAt, onClick }) => {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  return (
    <div
      className={`book-card${onClick ? " book-card--clickable" : ""}`}
      onClick={onClick}
    >
      <div className="book-card-bg"></div>
      <div className="book-card-content">
        <h3>{title}</h3>
        <p className="author">by {author}</p>
        {owner && <p className="owner">Owner: {owner}</p>}
        <p className="genre">Genre: {genre}</p>
        <div className="stars">
          {Array.from({ length: 5 }).map((_, i) =>
            <span key={i} className={(i < rating ? " book-card-star--filled" : " book-card-star--empty")}>
              ★
            </span>
          )}
        </div>
          {formattedDate && (
            <p className="book-card-date">Listed {formattedDate}</p>)}
      </div>
    </div>
  );
};

export default BookCard;
