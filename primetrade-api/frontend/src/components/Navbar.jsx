import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="icon">⚡</span>
          Primetrade
        </Link>

        {/* Nav links */}
        <div className="navbar-nav">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            📋 <span>Tasks</span>
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
            >
              🛡️ <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Right side: user info + logout */}
        <div className="navbar-right">
          <div className="user-pill">
            <div className="user-avatar-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user?.name}</span>
            {isAdmin && <span className="badge badge-admin" style={{ fontSize: 10, padding: '2px 8px' }}>Admin</span>}
          </div>

          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Logout">
            ↩ <span style={{ fontSize: 13 }}>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
