import { useLocation } from "react-router-dom";
import DashboardNavbar from "./DashbaordNavbar";
import NormalNavbar from "./NormalNavbar";

function Navbar() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isLoggedIn = localStorage.getItem("Loggedin") === "true";

  if (isDashboardRoute && !isLoggedIn) {
    return <NormalNavbar />;
  }
  if (isDashboardRoute && isLoggedIn) {
    return <DashboardNavbar />;
  }
  return <NormalNavbar />;
}

export default Navbar;