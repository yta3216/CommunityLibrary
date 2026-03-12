import Navbar from "../components/Navbar/Navbar";
import BookCard from "../components/BookCard/BookCard";
import avatar_placeholder from "../resources/avatar_placeholder.png";
import "./Profile.css";

const Profile = () => {
    const ownedBooks = [
        {
            id: "book-1",
            title: "Atomic Habits",
            ownerId: "owner-1",
            ownerName: "Kiichiro Suganuma",
            author: "James Clear",
            genres: ["Self-help", "Habits", "Psychology", "Personal Growth"],
            status: "available",
        },
        {
            id: "book-3",
            title: "To Kill a Mockingbird",
            ownerId: "owner-1",
            ownerName: "Kiichiro Suganuma",
            author: "Harper Lee",
            genres: ["Fiction", "Classic", "Historical"],
            status: "available",
        }
    ];
    const borrowedBooks = [
        {
            id: "book-2",
            title: "The Alchemist",
            ownerId: "owner-2",
            ownerName: "Sophie Johnson",
            author: "Paulo Coelho",
            genres: ["Fiction", "Adventure", "Fantasy"],
            status: "borrowed",
        },
    ];
    return (
        <>
            <Navbar isLoggedIn={true} />
            <div className="profile-container">
                

                <section className="profile-info">
                    <h1>Your Profile</h1>
                    <div className="profile-actions">
                        <a href="/messages" className="btn">
                            My Messages
                        </a>
                        <a href="/profile/edit" className="btn">
                            Edit Profile
                        </a>
                        <a href="/" className="btn">
                            Logout
                        </a>
                    </div>
                </section>

                <section className="books-section">
                    <h2>Owned Books</h2>
                    {ownedBooks.length === 0 ? (
                        <p>You don't own any books yet.</p>
                    ) : (
                        <div className="card-list">
                            {ownedBooks.map((book) => (
                                <BookCard
                                    key={book.id}
                                    title={book.title}
                                    author={book.author}
                                    genre={book.genres[0] || ""}
                                    rating={0}
                                    onClick={() => console.log("Clicked", book)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section className="books-section">
                    <h2>Borrowed Books</h2>
                    {borrowedBooks.length === 0 ? (
                        <p>You're not borrowing any books right now.</p>
                    ) : (
                        <div className="card-list">
                            {borrowedBooks.map((book) => (
                                <BookCard
                                    key={book.id}
                                    title={book.title}
                                    author={book.author}
                                    genre={book.genres[0] || ""}
                                    rating={0}
                                    onClick={() => console.log("Clicked", book)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
};

export default Profile;