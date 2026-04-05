import React from "react";
import "./BookCard.css";

const BookCard = ({ title, author, owner, genre, rating, onClick }) => {
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
      </div>
    </div>
  );
};

export default BookCard;
