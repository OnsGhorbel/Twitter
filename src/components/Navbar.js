
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Search', path: '/search' },
  { name: 'Profile', path: '/profile' },
];


function Navbar() {
  const location = useLocation();

  return (
    <nav
      style={{
        width: '220px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1da1f2 0%, #0a192f 100%)',
        color: '#fff',
        padding: '2rem 1rem',
        position: 'fixed',
        left: 0,
        top: 0,
        boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}   
      >
    <h2 style={{ marginBottom: '2rem', fontWeight: 700, letterSpacing: 1 }}>MyTwitter</h2>
      <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
        {navItems.map((item) => (
          <li key={item.path} style={{ marginBottom: '1.5rem', width: '100%' }}>
            <Link
              to={item.path}
              style={{
                textDecoration: 'none',
                color: location.pathname === item.path ? '#1da1f2' : '#fff',
                background: location.pathname === item.path ? '#fff' : 'transparent',
                padding: '0.75rem 1rem',
                borderRadius: '30px',
                fontWeight: 500,
                display: 'block',
                transition: 'all 0.2s',
                boxShadow: location.pathname === item.path ? '0 2px 8px rgba(29,161,242,0.08)' : 'none',
              }}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
