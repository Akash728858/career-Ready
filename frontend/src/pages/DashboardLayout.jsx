import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  User,
  LogOut,
  Camera,
  Eye,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/profile', icon: User, label: 'Profile', end: false },
  { to: '/dashboard/resume', icon: FileText, label: 'Resume Builder', end: false },
  { to: '/dashboard/job-tracker', icon: Briefcase, label: 'Job Tracker', end: false },
  { to: '/dashboard/placement', icon: Target, label: 'Placement Prep', end: false },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { profile, setPhotoUrl } = useProfile();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
    setDropdownOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <h2>Career Platform</h2>
        </div>
        <nav className="dashboard-sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `dashboard-nav-link${isActive ? ' active' : ''}`
              }
            >
              <Icon strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="dashboard-sidebar-footer">
          <button
            type="button"
            onClick={handleLogout}
            className="dashboard-logout-btn"
          >
            <LogOut strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h2>Career Platform</h2>
          <div className="dashboard-header-user" ref={dropdownRef}>
            <span className="dashboard-header-name">{displayName}</span>
            <button
              type="button"
              className="dashboard-header-avatar-btn"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-label="Profile menu"
            >
              {profile?.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt=""
                  className="dashboard-header-avatar-img"
                />
              ) : (
                <div className="dashboard-header-avatar">
                  <User size={20} strokeWidth={2} />
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="profile-photo-input"
              onChange={handlePhotoChange}
              aria-hidden="true"
            />
            {dropdownOpen && (
              <div className="dashboard-header-dropdown">
                <button
                  type="button"
                  className="dashboard-dropdown-item"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                >
                  <Camera size={18} strokeWidth={2} />
                  Upload / Change Profile Photo
                </button>
                <NavLink
                  to="/dashboard/profile"
                  className="dashboard-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Eye size={18} strokeWidth={2} />
                  View Profile
                </NavLink>
                <button
                  type="button"
                  className="dashboard-dropdown-item"
                  onClick={handleLogout}
                >
                  <LogOut size={18} strokeWidth={2} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
