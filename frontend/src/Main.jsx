import logo from "./resources/logo.png";
import "./Main.css";

import Navbar from "./components/navbar/navbar";
import Footer from "./components/footer";

function Main() {
  return (
    <div className="Main">
      <Navbar />
      <header className="Main-header">
        
        <p>
          Edit <code>src/Main.jsx</code> and save to reload.
        </p>
        <Footer />
        <a
          className="Main-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default Main;
