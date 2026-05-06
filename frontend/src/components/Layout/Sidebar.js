import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const menus = {
    etudiant: [
      { to: '/dashboard', label: 'Tableau de bord' },
      { to: '/stages',    label: 'Stages' },
      { to: '/profile',   label: 'Mon profil' },
    ],
    enseignant: [
      { to: '/dashboard', label: 'Tableau de bord' },
      { to: '/stages',    label: 'Stages' },
      { to: '/profile',   label: 'Mon profil' },
    ],
    tuteur: [
      { to: '/dashboard', label: 'Tableau de bord' },
      { to: '/stages',    label: 'Stages' },
      { to: '/profile',   label: 'Mon profil' },
    ],
    admin: [
      { to: '/dashboard',   label: 'Tableau de bord' },
      { to: '/stages',      label: 'Stages' },
      { to: '/admin/users', label: 'Administration' },
    ],
  };

  const links = menus[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Navigation</div>
      {links.map(link => (
        <NavLink
          key={link.to + link.label}
          to={link.to}
          end={link.to === '/dashboard'}
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-label">{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;