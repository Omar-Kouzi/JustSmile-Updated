import { NavLink } from "react-router-dom";
import Logo from "../../assets/Logo.png";
const DashboardNavbar = () => {
  
  return (
    <>
      <section className="Navbar">
        <img src={Logo} alt="icon" className="Navbar-Icon" />
        <div className="Navigators">
          <NavLink to="/">home</NavLink>
          <NavLink to="/dashboard/Dproducts">products</NavLink>
          <NavLink to="/dashboard/Dorders">ordere</NavLink>
        </div>
      </section>

  
    </>
  );
};

export default DashboardNavbar;
