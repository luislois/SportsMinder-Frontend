import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "antd";

const LoginButton = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <Button
      type="primary"
      onClick={isAuthenticated ? logout : loginWithRedirect}
      style={{ minWidth: "80px" }}
    >
      {isAuthenticated ? "Log out" : "Log in"}
    </Button>
  );
};

const SigninButton = () => {
  const { loginWithRedirect } = useAuth0();
  const signup = () => {
    loginWithRedirect({
      screen_hint: "signup",
    });
  };

  return (
    <Button type="primary" ghost onClick={signup} style={{ minWidth: "80px" }}>
      Sign in
    </Button>
  );
};

export { LoginButton, SigninButton };
