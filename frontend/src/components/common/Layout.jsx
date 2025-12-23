import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Layout.css';

const Layout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const getRolNombre = (rol) => {
    const roles = {
      postulante: 'Postulante',
      jefe: 'Jefe de Departamento',
      rrhh: 'Recursos Humanos'
    };
    return roles[rol] || rol;
  };

  const getRolColor = (rol) => {
    const colors = {
      postulante: '#3498db',
      jefe: '#9b59b6',
      rrhh: '#2ecc71'
    };
    return colors[rol] || '#34495e';
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              ☰
            </button>
            <div className="logo-container">
              <div className="logo-text">
                <h1 className="logo">Empresa Estatal de Transporte</h1>
                <span className="subtitle">Sistema de Pasantías</span>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            {usuario && (
              <div className="user-container">
                <div className="user-avatar">
                  {usuario.nombre?.charAt(0) || 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{usuario.nombre}</span>
                  <span 
                    className="user-role"
                    style={{ backgroundColor: getRolColor(usuario.rol) }}
                  >
                    {getRolNombre(usuario.rol)}
                  </span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Main Content */}
      <div className="main-container">
        {/* Sidebar */}
        {usuario && (
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3 className="sidebar-title">Menú Principal</h3>
            </div>
            
            <nav className="nav-menu">
              {/* Postulante */}
              {usuario.rol === 'postulante' && (
                <>
                  <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">Dashboard</span>
                  </Link>
                  <Link to="/mi-perfil" className={`nav-item ${isActive('/mi-perfil') ? 'active' : ''}`}>
                    <span className="nav-icon">👤</span>
                    <span className="nav-text">Mi Perfil</span>
                  </Link>
                  <Link to="/mis-documentos" className={`nav-item ${isActive('/mis-documentos') ? 'active' : ''}`}>
                    <span className="nav-icon">📄</span>
                    <span className="nav-text">Mis Documentos</span>
                  </Link>
                  <Link to="/mis-entrevistas" className={`nav-item ${isActive('/mis-entrevistas') ? 'active' : ''}`}>
                    <span className="nav-icon">💼</span>
                    <span className="nav-text">Mis Entrevistas</span>
                  </Link>
                  <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <span className="nav-text">Tutoriales</span>
                  </Link>
                </>
              )}

              {/* Jefe */}
              {usuario.rol === 'jefe' && (
                <>
                  <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">Dashboard</span>
                  </Link>
                  <Link to="/postulantes" className={`nav-item ${isActive('/postulantes') ? 'active' : ''}`}>
                    <span className="nav-icon">👥</span>
                    <span className="nav-text">Postulantes</span>
                  </Link>
                  <Link to="/mis-pasantes" className={`nav-item ${isActive('/mis-pasantes') ? 'active' : ''}`}>
                    <span className="nav-icon">🎓</span>
                    <span className="nav-text">Mis Pasantes</span>
                  </Link>
                  <Link to="/historial-entrevistas" className={`nav-item ${isActive('/historial-entrevistas') ? 'active' : ''}`}>
                    <span className="nav-icon">📋</span>
                    <span className="nav-text">Historial</span>
                  </Link>
                </>
              )}

              {/* RRHH */}
              {usuario.rol === 'rrhh' && (
                <>
                  <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">Dashboard</span>
                  </Link>
                  <Link to="/gestion-postulantes" className={`nav-item ${isActive('/gestion-postulantes') ? 'active' : ''}`}>
                    <span className="nav-icon">👥</span>
                    <span className="nav-text">Postulantes</span>
                  </Link>
                  <Link to="/agenda-entrevistas" className={`nav-item ${isActive('/agenda-entrevistas') ? 'active' : ''}`}>
                    <span className="nav-icon">📅</span>
                    <span className="nav-text">Entrevistas</span>
                  </Link>
                  <Link to="/departamentos" className={`nav-item ${isActive('/departamentos') ? 'active' : ''}`}>
                    <span className="nav-icon">🏢</span>
                    <span className="nav-text">Departamentos</span>
                  </Link>
                  <Link to="/induccion" className={`nav-item ${isActive('/induccion') ? 'active' : ''}`}>
                    <span className="nav-icon">🎯</span>
                    <span className="nav-text">Inducción</span>
                  </Link>
                  <Link to="/tutoriales" className={`nav-item ${isActive('/tutoriales') ? 'active' : ''}`}>
                    <span className="nav-icon">🎥</span>
                    <span className="nav-text">Tutoriales</span>
                  </Link>
                  <Link to="/reportes" className={`nav-item ${isActive('/reportes') ? 'active' : ''}`}>
                    <span className="nav-icon">📈</span>
                    <span className="nav-text">Reportes</span>
                  </Link>
                </>
              )}
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="content">
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;