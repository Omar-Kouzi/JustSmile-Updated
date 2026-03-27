import { Routes, Route } from "react-router-dom";
import Home from "../../routes/Home.jsx";
import Items from "../../routes/Items.jsx";
import About from "../../routes/About.jsx";
import Cart from "../../routes/Cart.jsx";
import Contact from "../../routes/Contact.jsx";
import Login from "../../routes/Login.jsx";
import Profile from "../../routes/Profile.jsx";
function NormalRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />{" "}
        <Route path="/items" element={<Items />} />{" "}
        <Route path="/about" element={<About />} />{" "}
        <Route path="/contact" element={<Contact />} />{" "}
        <Route path="/cart" element={<Cart />} />{" "}
        <Route path="/login" element={<Login />} />{" "}
        <Route path="/profile/:id" element={<Profile />} />{" "}
      </Routes>
    </div>
  );
}

export default NormalRoutes;
