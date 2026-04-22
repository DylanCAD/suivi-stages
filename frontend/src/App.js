import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// ── Pages ──
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import StageList from './pages/Stages/StageList';
import StageDetail from './pages/Stages/StageDetail';
import StageForm from './pages/Stages/StageForm';
import Profile from './pages/Profile/Profile';
import Evaluation from './pages/Evaluation/Evaluation';
import EvalTuteur from './pages/Evaluation/EvalTuteur';
import AdminUsers from './pages/Admin/AdminUsers';

// 🔐 MOT DE PASSE OUBLIÉ
import ForgotPassword from './pages/Login/ForgotPassword';
import ResetPassword from './pages/Login/ResetPassword';

import ContactAdmin   from './pages/Login/ContactAdmin';

// ── Garde de route : privé ──
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Chargement…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

// ── Route publique ──
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>

    {/* LOGIN */}
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />

    {/* 🔐 MOT DE PASSE OUBLIÉ */}
    <Route
      path="/forgot-password"
      element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      }
    />

    {/* 🔐 RESET MOT DE PASSE */}
    <Route
      path="/reset-password/:token"
      element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      }
    />

    {/* Formulaire tuteur (public avec token) */}
    <Route path="/eval/:id_stage/:token" element={<EvalTuteur />} />

    {/* HOME */}
    <Route path="/" element={<Navigate to="/dashboard" replace />} />

    {/* DASHBOARD */}
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    />

    {/* STAGES */}
    <Route
      path="/stages"
      element={
        <PrivateRoute>
          <StageList />
        </PrivateRoute>
      }
    />

    <Route
      path="/stages/nouveau"
      element={
        <PrivateRoute roles={['etudiant']}>
          <StageForm />
        </PrivateRoute>
      }
    />

    <Route
      path="/stages/:id"
      element={
        <PrivateRoute>
          <StageDetail />
        </PrivateRoute>
      }
    />

    <Route
      path="/stages/:id/modifier"
      element={
        <PrivateRoute roles={['etudiant']}>
          <StageForm />
        </PrivateRoute>
      }
    />

    <Route
      path="/stages/:id/evaluer"
      element={
        <PrivateRoute roles={['enseignant', 'admin']}>
          <Evaluation />
        </PrivateRoute>
      }
    />

    {/* PROFILE */}
    <Route
      path="/profile"
      element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      }
    />

    {/* ADMIN */}
    <Route
      path="/admin/users"
      element={
        <PrivateRoute roles={['admin']}>
          <AdminUsers />
        </PrivateRoute>
      }
    />

    {/* FALLBACK */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />

    <Route path="/contact-admin" element={
        <PublicRoute><ContactAdmin /></PublicRoute>
    }/>

  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        pauseOnHover
        theme="colored"
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;