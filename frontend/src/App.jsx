import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyBets from './pages/MyBets';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import PublicBets from './pages/PublicBets';
import FantasyClassification from './pages/FantasyClassification';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return user && user.is_admin ? children : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-bets"
            element={
              <PrivateRoute>
                <MyBets />
              </PrivateRoute>
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/public-bets"
            element={
              <PrivateRoute>
                <PublicBets />
              </PrivateRoute>
            }
          />
          <Route
            path="/fantasy-classification"
            element={
              <PrivateRoute>
                <FantasyClassification />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
