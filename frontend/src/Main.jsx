import "./Main.css";

import Navbar from "./components/navbar/NavBar";
import Footer from "./components/Footer";
import Booklist from "./components/SearchBookLayout";

function Main() {
  return (
    <div className="Main">
      {/*Navbar at the top*/}
      <Navbar />

      <div className="main-content">
        {/*Booklist in the middle*/}
        <Booklist />
      </div>
      
    </div>
  );
}

export default Main;
