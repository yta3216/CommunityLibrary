// Displays the book cover image and synopsis.

import { useState } from "react";
import "./BookCover.css";

function BookCover({ synopsis, postedCoverImage }) {
  // Tracks if the current user uploaded their own cover photo
  const [uploadedImage, setUploadedImage] = useState(null);

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  }

  // Decide what to show in the cover area
  const displayImage = uploadedImage || postedCoverImage || null;

  return (
    <div className="book-cover-wrapper">

      {/* LEFT: Book cover */}
      <div className="book-cover-frame">
        {displayImage ? (
          // Show either the uploaded image or the poster's image
          <img src={displayImage} alt="Book cover" className="book-cover-image" />
        ) : (
          // No image exists
          <label className="book-cover-upload-label"></label>
        )}
      </div>

      {/* RIGHT: Synopsis */}
      <div className="book-cover-synopsis">
        <h3 className="book-cover-synopsis-title">Synopsis</h3>
        <p className="book-cover-synopsis-text">
          {synopsis || 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'}
        </p>
      </div>

    </div>
  );
}

export default BookCover;