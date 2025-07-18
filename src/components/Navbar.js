import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../auth/authSlice';
import '../styles/Navbar.css'; 

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Search', path: '/search' },
  { name: 'Profile', path: '/profile' },
];

function Navbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <h2 className="navbar-title">MyTwitter</h2>
      <ul className="navbar-list">
        {navItems.map((item) => (
          <li key={item.path} className="navbar-list-item">
            <Link
              to={item.path}
              className={
                location.pathname === item.path
                  ? 'navbar-link active'
                  : 'navbar-link'
              }
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      
      {user && (
        <div className="navbar-user">
          <div className="user-info">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=1DA1F2&color=fff`} 
              alt={user.name} 
              className="user-avatar"
            />
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              {user.username && <span className="user-username">@{user.username}</span>}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
