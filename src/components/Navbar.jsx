import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (!user) {
    return (
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          Fantasy Betting
        </Link>
        <ul className="navbar-nav">
          <li><Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>Rànking</Link></li>
          <li><Link to="/login" className={`nav-link ${isActive('/login')}`}>Login</Link></li>
          <li><Link to="/register" className={`nav-link ${isActive('/register')}`}>Registrar-se</Link></li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Fantasy Betting
      </Link>
      <ul className="navbar-nav">
        <li><Link to="/" className={`nav-link ${isActive('/')}`}>Apostes</Link></li>
        <li><Link to="/my-bets" className={`nav-link ${isActive('/my-bets')}`}>Les meves apostes</Link></li>
        <li><Link to="/public-bets" className={`nav-link ${isActive('/public-bets')}`}>Apostes dels demés</Link></li>
        <li><Link to="/copa-del-rei" className={`nav-link ${isActive('/copa-del-rei')}`}>Copa del Rei</Link></li>
        <li><Link to="/fantasy-classification" className={`nav-link ${isActive('/fantasy-classification')}`}>Classificació Fantasy</Link></li>
        <li><Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>Rànking</Link></li>
        {user.is_admin && (
          <li><Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin</Link></li>
        )}
        <li>
          <div className="wallet" style={{ padding: '0.5rem 1rem', margin: 0 }}>
            <span style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>💰</span>
            <strong>{Number(user.coins).toFixed(0)}</strong>
            <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>monedes</span>
          </div>
        </li>
        <li><button onClick={handleLogout} className="btn btn-outline">Sortir</button></li>
      </ul>
    </nav>
  );
}

export default Navbar;