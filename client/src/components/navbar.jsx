import { useState } from "react";
import { Link, useNavigate } from "react-router";

export function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (!user) {
  //     navigate("/login");
  //   }
  //   setUser(user);
  // }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark"
      style={{
        marginBottom: 20,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Link className="navbar-brand" to={"/home"}>
        SPOTT
      </Link>

      <div className="navbar-collapse" id="navbarText">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item active">
            <a className="nav-link" onClick={logout}>
              Logout
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
