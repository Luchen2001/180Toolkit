import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Cash } from './pages/Cash'
import { Home } from './pages/Home';
import { Placement } from './pages/Placement';
import { Stock } from './pages/Stock';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Setting } from './pages/Setting';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/login' element={<Login/>}/>
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/home" />} />
            <Route path='home' element={<Home />} />
            <Route path='cash' element={<Cash />} />
            <Route path='placement' element={<Placement />} />
            <Route path='stock' element={<Stock />} />
            <Route path='admin' element={<Admin />} />
            <Route path='setting' element={<Setting />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
