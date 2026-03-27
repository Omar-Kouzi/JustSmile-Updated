import { useLocation } from "react-router-dom";
import NormalRoutes from "./NormalRouter";
import DashboardRoutes from "./DashbaordRouter";

function Routes() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");
  const isLoggedIn = localStorage.getItem("Loggedin") === "true"; // ✅ use getItem

  if (isDashboardRoute && !isLoggedIn) {
    return (
      <div>
        <h3>You're not supposed to be here</h3>
      </div>
    );
  }

  return <div>{isDashboardRoute ? <DashboardRoutes /> : <NormalRoutes />}</div>;
}

export default Routes;