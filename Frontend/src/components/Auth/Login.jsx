import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield, Stethoscope, Users, User, AlertCircle, Loader2, ArrowLeft, Hospital } from 'lucide-react';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.role || null;

  const getRoleInfo = () => {
    const roleMap = {
      admin: { icon: Shield, label: 'Admin' },
      doctor: { icon: Stethoscope, label: 'Doctor' },
      receptionist: { icon: Users, label: 'Receptionist' },
      patient: { icon: User, label: 'Patient' }
    };
    return roleMap[selectedRole] || { icon: Shield, label: 'Login' };
  };

  const roleInfo = getRoleInfo();
  const IconComponent = roleInfo.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate(`/${result.role}/dashboard`);
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className={styles.loginContainer}>
      {/* Background Decoration */}
      <div className={styles.bgDecoration}></div>

      <div className={styles.loginCard}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <Hospital size={48} className={styles.heroIcon} />
          <div className={styles.roleIcon}>
            <IconComponent size={56} strokeWidth={1.5} />
          </div>
          <h2 className={styles.mainTitle}>AI Clinic Management</h2>
          <p className={styles.subtitle}>Login as {roleInfo.label}</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className={styles.linkBtn}
            >
              Sign Up
            </button>
          </p>
          {/* Removed direct admin login shortcut to avoid confusion */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className={styles.backBtn}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;