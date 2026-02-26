import React from "react";
import Sidebar from "../components/sidebar/sidebar";
import BookCard from "../components/BookCard";

const Home = () => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "20px", padding: "20px" }}>
        <h1>Welcome to Community Library</h1>
        <p>This is the Home page.</p>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <BookCard title="The Great Gatsby" genre="Fiction" rating={4} />
          <BookCard
            title="To Kill a Mockingbird"
            genre="Classic Literature"
            rating={5}
          />
          <BookCard title="1984" genre="Dystopian Fiction" rating={5} />
        </div>
      </div>
    </div>
  );
};

export default Home;
