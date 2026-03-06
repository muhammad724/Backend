import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  UserCheck,
  TrendingUp,
  FileText,
  BookOpen,
  Calendar,
  Clock,
  Pill,
  User,
  LogOut,
  Shield,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminLinks = [
    { to: '/admin/dashboard', text: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/doctors', text: 'Doctors', icon: Stethoscope },
    { to: '/admin/receptionists', text: 'Receptionists', icon: Users },
    { to: '/admin/subscriptions', text: 'Subscriptions', icon: BookOpen },
    { to: '/admin/analytics', text: 'Analytics', icon: TrendingUp },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', text: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', text: 'Appointments', icon: Calendar },
    { to: '/doctor/patients', text: 'Patients', icon: Users },
    { to: '/doctor/prescriptions', text: 'Prescriptions', icon: Pill },
    { to: '/doctor/ai-symptom-checker', text: 'AI Analyzer', icon: Stethoscope },
    { to: '/doctor/analytics', text: 'My Analytics', icon: TrendingUp },
  ];

  const receptionistLinks = [
    { to: '/receptionist/dashboard', text: 'Dashboard', icon: LayoutDashboard },
    { to: '/receptionist/register-patient', text: 'Register Patient', icon: FileText },
    { to: '/receptionist/book-appointment', text: 'Book Appointment', icon: Calendar },
    { to: '/receptionist/schedule', text: 'Daily Schedule', icon: Clock },
  ];

  const patientLinks = [
    { to: '/patient/dashboard', text: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/appointments', text: 'My Appointments', icon: Calendar },
    { to: '/patient/prescriptions', text: 'My Prescriptions', icon: Pill },
    { to: '/patient/profile', text: 'My Profile', icon: User },
  ];

  const getRoleInfo = () => {
    const roleMap = {
      admin: { icon: Shield, color: 'purple', label: 'Admin' },
      doctor: { icon: Stethoscope, color: 'blue', label: 'Doctor' },
      receptionist: { icon: Users, color: 'green', label: 'Receptionist' },
      patient: { icon: User, color: 'orange', label: 'Patient' }
    };
    return roleMap[user?.role] || { icon: Shield, color: 'gray', label: 'User' };
  };

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return adminLinks;
      case 'doctor':
        return doctorLinks;
      case 'receptionist':
        return receptionistLinks;
      case 'patient':
        return patientLinks;
      default:
        return [];
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;
  const links = getLinks();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`${styles.sidebar} ${styles[`color${roleInfo.color}`]}`}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <div className={styles.roleIconLarge}>
          <RoleIcon size={48} strokeWidth={1.5} />
        </div>
        <h1 className={styles.appTitle}>AI Clinic</h1>
        <p className={styles.userInfo}>{user?.name || 'User'}</p>
        <p className={`${styles.roleLabel} ${styles[`role${roleInfo.color}`]}`}>
          {roleInfo.label}
        </p>
      </div>

      {/* Navigation */}
      <nav className={styles.navMenu}>
        <div className={styles.navTitle}>Menu</div>
        {links.map((link, index) => {
          const LinkIcon = link.icon;
          return (
            <NavLink
              key={index}
              to={link.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.linkIcon}>
                <LinkIcon size={20} strokeWidth={1.5} />
              </span>
              <span className={styles.linkText}>{link.text}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          title="Logout"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className={styles.logoutText}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;