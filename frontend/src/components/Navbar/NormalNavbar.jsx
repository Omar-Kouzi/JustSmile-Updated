import { NavLink } from "react-router-dom";
import { RiLoginBoxLine, RiLogoutBoxLine } from "react-icons/ri";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { logout } from "../../assets/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../assets/firebase/config";
import SecureLS from "secure-ls";
import Logo from "../../assets/Logo.png";

const ls = new SecureLS({ encodingType: "aes" });

const NormalNavbar = () => {
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [role, setRole] = useState(null); // ✅ NEW

  useEffect(() => {
    // 🔐 Track Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUid(currentUser.uid);
      } else {
        setUid(null);
      }
    });

    // 📦 Get stored data
    const storedUid = ls.get("uid");
    const storedRole = ls.get("role");

    if (storedUid) setUid(storedUid);
    if (storedRole) setRole(storedRole);

    return () => unsubscribe();
  }, []);

  // 🔓 Logout
  const handleLogout = async () => {
    try {
      await logout();
      ls.set("Loggedin", false);
      ls.remove("uid");
      ls.remove("role");

      setUser(null);
      setUid(null);
      setRole(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <section className="Navbar">
      <img src={Logo} alt="icon" className="Navbar-Icon" />

      <div className="Navigators">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>

        {/* ✅ Admin Dashboard */}
        {user && role === "admin" && (
          <NavLink to="/dashboard">Dashboard</NavLink>
        )}

        {/* ✅ Login / Logout */}
        {!user ? (
          <NavLink to="/login">
            login <RiLoginBoxLine />
          </NavLink>
        ) : (
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: "white",
            }}
          >
            logout <RiLogoutBoxLine />
          </button>
        )}

        {/* ✅ Cart & Profile */}
        {user && uid && (
          <div className="Navigators-Icons">
            <NavLink to="/cart">
              <FaShoppingCart />
            </NavLink>

            <NavLink to={`/profile/${uid}`}>
              <FaUserCircle />
            </NavLink>
          </div>
        )}
      </div>
    </section>
  );
};

export default NormalNavbar;