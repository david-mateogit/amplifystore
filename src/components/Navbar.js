import React from "react";
import { Menu as Nav, Icon, Button } from "element-react";
import { NavLink } from "react-router-dom";

const Navbar = ({ user, handleSignOut }) => (
  <div>
    <Nav theme="dark" defaultActive="1" mode="horizontal">
      <div className="nav-container">
        <Nav.Item index="1">
          <NavLink to="/" className="nav-link">
            <span className="app-title">
              <img
                src="https://icon.now.sh/account_balance/f90"
                alt="App Icon"
                className="app-icon"
              />{" "}
              Amplify-Store
            </span>
          </NavLink>
        </Nav.Item>
        <div className="nav-items">
          <Nav.Item index="2">
            <span className="app-user">Hello, {user}</span>
          </Nav.Item>
          <Nav.Item index="3">
            <NavLink to="/profile" className="nav-link">
              <Icon name="setting" />
              Profile
            </NavLink>
          </Nav.Item>
          <Nav.Item index="4">
            <Button type="warning" onClick={handleSignOut}>
              {" "}
              Sign Out
            </Button>
          </Nav.Item>
        </div>
      </div>
    </Nav>
  </div>
);

export default Navbar;
