import { NavLink } from "react-router-dom";
// import { RiLoginBoxLine } from "react-icons/ri";
import Logo from "../../assets/Logo.png";
const DashboardNavbar = () => {
  // const [isNavVisible, setNavVisible] = useState(false);
  // const toggleNav = () => {
  //   setNavVisible(!isNavVisible);
  // };
  return (
    <>
      <section className="Navbar">
        <img src={Logo} alt="icon" className="Navbar-Icon" />
        <div className="Navigators">
          <NavLink to="/dashboard/projects">Projects</NavLink>
          <NavLink to="/dashboard/skills">Skills</NavLink>
          <NavLink to="/">home</NavLink>
        </div>
      </section>

      {/* <button className="Navbar-Toggle" onClick={toggleNav}>
        ☰
      </button>

      <section className={`Responcive-Navbar ${isNavVisible ? "visible" : ""}`}>
        <img src={Logo} alt="icon" className="Navbar-Icon" />
        <div className="Navigators">
          <NavLink onClick={toggleNav} to="/dashboard/projects">
            Projects
          </NavLink>
          <NavLink onClick={toggleNav} to="/dashboard/skills">
            Skills
          </NavLink>{" "}
          <NavLink to="/" onClick={toggleNav}>
            home
          </NavLink>{" "}
          *
        </div>
      </section> */}
    </>
  );
};

export default DashboardNavbar;
