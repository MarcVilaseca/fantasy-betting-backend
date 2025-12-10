import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600';
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl flex items-center gap-2">
              ⚽ FantasyBet
            </Link>
            
            {user && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
                  Inici
                </Link>
                <Link to="/betting" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/betting')}`}>
                  Apostar
                </Link>
                <Link to="/ranking" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/ranking')}`}>
                  Classificació
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin')}`}>
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-blue-100 text-sm hidden sm:block">
                  Hola, {user.username}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Tancar Sessió
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-white hover:text-blue-200">Entrar</Link>
                <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50">
                  Registrar-se
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
