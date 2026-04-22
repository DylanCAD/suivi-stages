import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const menus = {
    etudiant: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/stages',    label: 'Mes stages' },
      { to: '/documents', label: 'Documents' },
      { to: '/profile',   label: 'Mon profil' },
    ],
    enseignant: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/stages',    label: 'Dossiers' },
      { to: '/profile',   label: 'Mon profil' },
    ],
    tuteur: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/stages',    label: 'Mes stagiaires' },
      { to: '/profile',   label: 'Mon profil' },
    ],
    admin: [
      { to: '/dashboard',   label: 'Tableau de bord' },
      { to: '/stages',      label: 'Tous les stages' },
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