import { useState } from "react";
const EMPTY_VALUES = {
    isbn: "",
    title: "",
    author: "",
    genre: "",
    description: "",
};

export default function BookForm({ initialValues = EMPTY_VALUES, onSubmit, onCancel, modalTitle = "Create new Book", }) {
    const [values, setValues] = useState(initialValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            isbn: values.isbn.trim(),
            title: values.title.trim(),
            author: values.author.trim(),
            genre: values.genre.trim(),
            description: values.description.trim(),
        };

        if (!payload.isbn || !payload.title || !payload.author || !payload.genre || !payload.description) {
            setErrorMessage("All fields are required.");
            return;
        }
        if (Number.isNaN(Number(payload.isbn))) {
            setErrorMessage("ISBN must be a valid number.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await onSubmit(payload);
            setValues(initialValues);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <h3 className="modal-title">{modalTitle}</h3>
                <form onSubmit={handleSubmit} className="form-grid">
                    <label htmlFor="book-isbn" className="form-label">
                        ISBN
                    </label>
                    <input
                        id="book-isbn"
                        name="isbn"
                        required
                        value={values.isbn}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="ISBN number here"
                    />

                    <label htmlFor="book-title" className="form-label">
                        Title
                    </label>
                    <input
                        id="book-title"
                        name="title"
                        required
                        value={values.title}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Book title here"
                    />

                    <label htmlFor="book-author" className="form-label">
                        Author
                    </label>
                    <input
                        id="book-author"
                        name="author"
                        required
                        value={values.author}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Author name here"
                    />

                    <label htmlFor="book-genre" className="form-label">
                        Genre
                    </label>
                    <input
                        id="book-genre"
                        name="genre"
                        required
                        value={values.genre}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Genre here"
                    />

                    <label htmlFor="book-description" className="form-label">
                        Description
                    </label>
                    <textarea
                        id="book-description"
                        name="description"
                        required
                        value={values.description}
                        onChange={handleChange}
                        className="form-textarea"
                        placeholder="Write a short description"
                    />

                    {errorMessage ? (
                        <p className="text-error">{errorMessage}</p>
                    ) : null}

                    <div className="modal-button-row">
                        <button
                            type="submit"
                            className="button-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Submit"}
                        </button>

                        {onCancel ? (
                            <button
                                type="button"
                                className="button-secondary"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                        ) : null}
                    </div>
                </form>
            </div>
        </div>
    );
}