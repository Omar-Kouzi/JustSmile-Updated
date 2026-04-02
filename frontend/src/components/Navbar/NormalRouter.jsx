import { Routes, Route } from "react-router-dom";
import Home from "../../routes/Home.jsx";
import Products from "../../routes/Products.jsx";
import Product from "../../routes/Product.jsx";
import About from "../../routes/About.jsx";
import Cart from "../../routes/Cart.jsx";
import Contact from "../../routes/Contact.jsx";
import Login from "../../routes/Login.jsx";
import Profile from "../../routes/Profile.jsx";
import Order from "../../routes/Order.jsx";
import PurchaseDetails from "../../routes/Puchase.jsx";
function NormalRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />{" "}
        <Route path="/products" element={<Products />} />{" "}
        <Route path="/product/:id" element={<Product />} />{" "}
        <Route path="/about" element={<About />} />{" "}
        <Route path="/contact" element={<Contact />} />{" "}
        <Route path="/cart" element={<Cart />} />{" "}
        <Route path="/login" element={<Login />} />{" "}
        <Route path="/profile/:id" element={<Profile />} />{" "}
        <Route path="/order" element={<Order />} />{" "}
        <Route path="/purchasedetail/:id" element={<PurchaseDetails />} />{" "}
        
      </Routes>
    </div>
  );
}

export default NormalRoutes;
