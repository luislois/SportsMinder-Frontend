import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { UserOutlined, MenuOutlined, HomeOutlined } from "@ant-design/icons";
import { LoginButton, SigninButton } from "./Buttons";
import logo from "../assets/logo.png";
import "../styles/Header.css";

const Header = ({ isAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <div className="header-content">
        <div className="header-logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        <div className="header-actions">
          <Button
            className="menu-button"
            icon={<MenuOutlined />}
            onClick={toggleMenu}
            style={{ display: "none" }}
          />
          <div className={`nav-menu ${isMenuOpen ? "open" : ""}`}>
            <Link to="/" onClick={toggleMenu}>
              <Button
                type="secondary"
                icon={<HomeOutlined />}
                className="profile-button"
              />
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={toggleMenu}>
                  <Button
                    type="secondary"
                    icon={<UserOutlined />}
                    className="profile-button"
                  />
                </Link>
                <LoginButton />
              </>
            ) : (
              <>
                <SigninButton />
                <LoginButton />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
