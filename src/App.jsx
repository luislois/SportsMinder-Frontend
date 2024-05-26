import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Track from './pages/Track'

const App = () => {

  return (
      <BrowserRouter>
      <Routes>
        <Route path= '/' element={<Home />}/>
        <Route path= '/profile' element={<Profile />}/>
        <Route path='/tracks/:trackId' element={<Track />}/>
        <Route path='*' element={<div>Page Not Found!</div>}/>
      </Routes>
      </BrowserRouter>
  )
}

export default App;
