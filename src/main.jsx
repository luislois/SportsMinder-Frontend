import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_ClIENTID}
    useRefreshTokens={true}
    cacheLocation="localstorage"
    scope="read:current_user update:current_user_metadata"
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
  >
    <React.StrictMode>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        <AntdApp>
          <App />
        </AntdApp>
      </ConfigProvider>
    </React.StrictMode>
  </Auth0Provider>
);
