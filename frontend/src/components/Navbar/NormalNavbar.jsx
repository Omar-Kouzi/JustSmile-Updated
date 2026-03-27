import { NavLink } from "react-router-dom";
import { RiLoginBoxLine, RiLogoutBoxLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { logout } from "../../assets/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../assets/firebase/config";
import Logo from "../../assets/Logo.png";

const NormalNavbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // cleanup
  }, []);

  // 🔓 Logout
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.setItem("Loggedin", "false");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <section className="Navbar">
      <img src={Logo} alt="icon" className="Navbar-Icon" />

      <div className="Navigators">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/items">Items</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>

        {/* ✅ Conditional Login / Logout */}
        {!user ? (
          <NavLink to="/login">
            login <RiLoginBoxLine />
          </NavLink>
        ) : (
          <button
            onClick={handleLogout}
            style={{ background: "none", border: "none", cursor: "pointer",fontSize:"16px" }}
          >
            logout <RiLogoutBoxLine />
          </button>
        )}

        {user && (
          <div className="Navigators-Icons">
            <NavLink to="/cart">
              <RiLoginBoxLine />
            </NavLink>

            <NavLink to="/profile">
              <RiLoginBoxLine />
            </NavLink>
          </div>
        )}
      </div>
    </section>
  );
};

export default NormalNavbar;
