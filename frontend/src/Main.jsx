import logo from './logo.svg';
import './Main.css';
import Footer from './components/footer';

function Main() {
  return (
    <div className="Main">
      <header className="Main-header">
        <img src={logo} className="Main-logo" alt="logo" />
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
