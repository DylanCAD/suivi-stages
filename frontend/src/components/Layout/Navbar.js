import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notifAPI } from '../../services/api';
import './Navbar.css';
import logo from '../../assets/logo.png';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="StageTrack">
    <rect width="32" height="32" rx="8" fill="#2563eb"/>
    <path d="M8 22 L16 10 L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M11 18 L21 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="10" r="2" fill="white"/>
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs]         = useState([]);
  const [nbNonLues, setNbNonLues]   = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser,   setShowUser]   = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await notifAPI.getAll({ lue: false });
        setNotifs(res.data.notifications.slice(0, 5));
        setNbNonLues(res.data.nb_non_lues);
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const marquerLue = async (id) => {
    await notifAPI.marquerLue(id);
    setNotifs(n => n.filter(x => x.id_notification !== id));
    setNbNonLues(n => Math.max(0, n - 1));
  };

  const roleLabel = {
    etudiant:   'Étudiant',
    enseignant: 'Enseignant',
    tuteur:     'Tuteur',
    admin:      'Admin',
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" aria-label="Accueil StageTrack">
        <img src={logo} alt="Logo" className="navbar-logo-img" />
        <span className="navbar-logo-text">StageTrack</span>
      </Link>

      <div className="navbar-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/stages"    className="nav-link">Stages</Link>
        {user?.role === 'etudiant' && (
          <Link to="/documents" className="nav-link">Documents</Link>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin/users" className="nav-link">Administration</Link>
        )}
      </div>

      <div className="navbar-right">
        <div className="notif-wrapper" ref={notifRef}>
          <button className="icon-btn" onClick={() => setShowNotifs(v => !v)} aria-label="Notifications">
            <Bell size={18} />
            {nbNonLues > 0 && <span className="notif-badge">{nbNonLues}</span>}
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-head">
                <span>Notifications</span>
                {nbNonLues > 0 && (
                  <button onClick={async () => {
                    await notifAPI.marquerTout();
                    setNotifs([]); setNbNonLues(0);
                  }} className="notif-clear">Tout marquer lu</button>
                )}
              </div>
              {notifs.length === 0 ? (
                <div className="notif-empty">Aucune nouvelle notification</div>
              ) : (
                notifs.map(n => (
                  <div key={n.id_notification} className="notif-item">
                    <div className="notif-dot"></div>
                    <div className="notif-content">
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-time">
                        {new Date(n.date_envoi).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <button className="notif-read-btn" onClick={() => marquerLue(n.id_notification)} aria-label="Marquer comme lue">
                      <Check size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="user-wrapper" ref={userRef}>
          <button className="user-btn" onClick={() => setShowUser(v => !v)}>
            <div className="avatar">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.prenom} {user?.nom}</span>
              <span className="user-role">{roleLabel[user?.role]}</span>
            </div>
            <ChevronDown size={14} />
          </button>

          {showUser && (
            <div className="user-dropdown">
              <Link to="/profile" className="user-dd-item" onClick={() => setShowUser(false)}>
                <User size={14} /> Mon profil
              </Link>
              <div className="user-dd-sep"></div>
              <button className="user-dd-item danger" onClick={handleLogout}>
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;