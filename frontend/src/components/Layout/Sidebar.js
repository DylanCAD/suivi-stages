import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  // Menus selon le rôle
  const menus = {
    etudiant: [
      { to: '/dashboard',  icon: '🏠', label: 'Dashboard' },
      { to: '/stages',     icon: '📋', label: 'Mes stages' },
      { to: '/documents',  icon: '📁', label: 'Documents' },
      { to: '/profile',    icon: '👤', label: 'Mon profil' },
    ],
    enseignant: [
      { to: '/dashboard',  icon: '🏠', label: 'Dashboard' },
      { to: '/stages',     icon: '📋', label: 'Dossiers' },
      { to: '/profile',    icon: '👤', label: 'Mon profil' },
    ],
    tuteur: [
      { to: '/dashboard',  icon: '🏠', label: 'Dashboard' },
      { to: '/stages',     icon: '📋', label: 'Mes stagiaires' },
      { to: '/profile',    icon: '👤', label: 'Mon profil' },
    ],
    admin: [
      { to: '/dashboard',  icon: '📊', label: 'Tableau de bord' },
      { to: '/stages',     icon: '📋', label: 'Tous les stages' },
      { to: '/admin/users',icon: '👥', label: 'Utilisateurs' },
      { to: '/admin',      icon: '⚙️', label: 'Administration' },
    ],
  };

  const links = menus[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Navigation</div>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/dashboard'}
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="sidebar-icon">{link.icon}</span>
          <span className="sidebar-label">{link.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;