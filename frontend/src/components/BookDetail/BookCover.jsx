// Displays the book cover image and synopsis.

import { useState } from "react";

function BookCover({ synopsis, postedCoverImage, isLoggedIn }) {
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
    <div style={styles.wrapper}>

      {/* LEFT: Book cover */}
      <div style={styles.coverWrapper}>
        {displayImage ? (
          // Show either the uploaded image or the poster's image
          <img src={displayImage} alt="Book cover" style={styles.coverImage} />
        ) : (
          // No image exists
          <label style={styles.uploadLabel}></label>
        )}
      </div>

      {/* RIGHT: Synopsis */}
      <div style={styles.synopsis}>
        <h3 style={styles.synopsisTitle}>Synopsis</h3>
        <p style={styles.synopsisText}>
          {synopsis || 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'}
        </p>
      </div>

    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '40px',
    alignItems: 'flex-start',
    padding: '32px',
    backgroundColor: '#f5f5f0',
    borderRadius: '8px',
    marginBottom: '32px',
  },
  coverWrapper: {
    width: '160px',
    height: '200px',
    flexShrink: 0,
    borderRadius: '8px',
    // Same gradient as BookCard as the default
    background: 'linear-gradient(135deg, #7ec8c8 0%, #a8d8a8 50%, #f7d9b5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverImage: {
    width: '160px',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
  },
  
  synopsis: {
    flex: 1,
  },
  synopsisTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    margin: '0 0 12px',
    color: '#000',
  },
  synopsisText: {
    fontSize: '0.9rem',
    color: '#444',
    lineHeight: '1.6',
    margin: 0,
  },
};

export default BookCover;