import { NavLink } from "react-router-dom";
import Logo from "../../assets/Logo.png";
const DashboardNavbar = () => {
  
  return (
    <>
      <section className="Navbar">
        <img src={Logo} alt="icon" className="Navbar-Icon" />
        <div className="Navigators">
          <NavLink to="/dashboard/">home</NavLink>
          <NavLink to="/dashboard/Dproject">products</NavLink>
        </div>
      </section>

  
    </>
  );
};

export default DashboardNavbar;
