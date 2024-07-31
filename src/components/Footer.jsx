import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </div>
        <div className="footer-info">
          <p>&copy; 2024 SportsMinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
