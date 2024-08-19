import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Track from "./pages/Track";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Stats from "./pages/Stats";
import { useAuth0 } from "@auth0/auth0-react";

const App = () => {
  const { user } = useAuth0();
  return (
    <BrowserRouter>
      <Header isAuthenticated={user} />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/tracks/:trackId" element={<Track />} />
          <Route path="*" element={<div>Page Not Found!</div>} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
