import { Link } from 'react-router-dom';
import { Button} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { LoginButton, SigninButton } from './Buttons';
import { useAuth0 } from '@auth0/auth0-react';
import logo from '../assets/logo.png';
import '../styles.css';

const Header = () => {
  const {isAuthenticated } = useAuth0();

  return (
    <header>
          <div>
          <Link to="/"> 
            <img src={logo} alt="Logo" style={{ height: 50, marginTop: 10 }} />
          </Link>
          </div>
          <div>
            {!isAuthenticated && (
              <SigninButton/> 
            )}
            {isAuthenticated && (
              <Link to="/profile"> 
                <Button type='secondary' icon = <UserOutlined/> style={{ marginRight: '15px'}} /> 
              </Link> 
            )}
            
            <LoginButton/>
          </div>
    </header> 
  );
};

export default Header;
