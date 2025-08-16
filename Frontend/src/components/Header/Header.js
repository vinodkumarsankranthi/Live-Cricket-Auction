import React, { useState, useRef, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import { customAlert } from '../SweetAlertCommon/Custom';
import { AuthContext } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const avatarButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navRightRef = useRef(null);

  const getInitial = (name) => name?.trim().charAt(0).toUpperCase() || '?';

  const toggleDropdown = () => setShowDropdown(prev => !prev);

  const handleLogout = () => {
    logout();
    customAlert("Logged Out", "You have been successfully logged out.", "success");
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
    return navigate(`/dashboard`);
  };

    useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !avatarButtonRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }

      if (
        showMobileMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !navRightRef.current.contains(e.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  return (
    <header className="header">
      <div className="logo">
        <img src="/websitelogo.png" alt="Logo" className="logo-image" />
      </div>

      <div className="nav-right" ref={navRightRef}>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
          <NavLink to="/upcoming-auctions" className={({ isActive }) => isActive ? 'active' : ''}>Upcoming Auctions</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/pricing" className={({ isActive }) => isActive ? 'active' : ''}>Pricing Plans</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact Us</NavLink>
        </nav>

        <button className="avatar-button" onClick={toggleDropdown} ref={avatarButtonRef}>
         <span>{user?.name?.split(' ')[0] || 'Guest'}</span>
         <span style={{ marginLeft: '6px',fontSize: '0.7rem',paddingTop: '1px' }}>▼</span>
        </button>

        {showDropdown && (
          <div className="dropdown" ref={dropdownRef}>
            {user ? (
              <>
                <button onClick={() => { setShowDropdown(false); navigate('/profile'); }}>View Profile</button>               
                {user.role === 'admin' && (<button onClick={() => { setShowDropdown(false); navigate('/admin-dashboard'); }}>Admin Dashboard</button>)}
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button onClick={() => navigate('/auth')}>Login</button>
            )}
          </div>
        )}

        <img
          src="/mobileview.png"
          alt="Menu"
          className="mobile-menu-icon"
          onClick={() => setShowMobileMenu(prev => !prev)}
        />
      </div>

      {showMobileMenu && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <NavLink to="/" onClick={() => setShowMobileMenu(false)}>Home</NavLink>
          <NavLink to="/upcoming-auctions" onClick={() => setShowMobileMenu(false)}>Upcoming Auctions</NavLink>
          <NavLink to="/dashboard" onClick={() => setShowMobileMenu(false)}>Dashboard</NavLink>
          <NavLink to="/pricing" onClick={() => setShowMobileMenu(false)}>Pricing Plans</NavLink>
          <NavLink to="/contact" onClick={() => setShowMobileMenu(false)}>Contact Us</NavLink>
          {user ? (
            <>
              <button onClick={() => { navigate('/profile'); setShowMobileMenu(false); }}>View Profile</button>
              {user.role === 'admin' && (<button onClick={() => { navigate('/admin-dashboard'); setShowMobileMenu(false); }}>Admin Dashboard</button>)}
              <button onClick={() => { handleLogout(); setShowMobileMenu(false); }}>Logout</button>
            </>
          ) : (
            <button onClick={() => { navigate('/auth'); setShowMobileMenu(false); }}>Login</button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
