import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Map, Upload, Home, LogOut, Menu, Compass, Settings } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/upload', icon: <Upload size={18} />, label: 'New Itinerary' },
    { to: '/profile', icon: <Settings size={18} />, label: 'Settings' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo">
          <Compass size={24} className="sidebar__logo-icon" />
          <span className="sidebar__logo-text">Wandr</span>
        </div>

        <nav className="sidebar__nav">
          {navLinks.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{user?.name}</p>
              <p className="sidebar__user-email">{user?.email}</p>
            </div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="layout__overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <main className="layout__main">
        <header className="layout__topbar">
          <button className="layout__menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="layout__topbar-brand">
            <Compass size={20} />
            <span>Wandr</span>
          </div>
        </header>

        <div className="layout__content page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
