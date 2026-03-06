import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Shield,
  Stethoscope,
  Users,
  User,
  Building2,
  Zap,
  Lock,
  SmilePlus,
} from 'lucide-react';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // If user is already logged in, redirect to their dashboard
  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginClick = (role) => {
    navigate('/login', { state: { role } });
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      icon: Shield,
      description: 'Manage doctors, receptionists, and clinic operations',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:shadow-purple-200'
    },
    {
      id: 'doctor',
      name: 'Doctor',
      icon: Stethoscope,
      description: 'Manage patients, appointments, and prescriptions',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:shadow-blue-200'
    },
    {
      id: 'receptionist',
      name: 'Receptionist',
      icon: Users,
      description: 'Register patients and book appointments',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      hoverColor: 'hover:shadow-green-200'
    },
    {
      id: 'patient',
      name: 'Patient',
      icon: User,
      description: 'View appointments and medical records',
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      hoverColor: 'hover:shadow-orange-200'
    }
  ];

  const features = [
    {
      icon: Building2,
      title: 'Comprehensive Management',
      description: 'Manage all clinic operations in one place'
    },
    {
      icon: Zap,
      title: 'AI-Powered',
      description: 'Smart symptom checking and analytics'
    },
    {
      icon: SmilePlus,
      title: 'User Friendly',
      description: 'Intuitive design for all users'
    },
    {
      icon: Lock,
      title: 'Secure',
      description: 'Protected patient data and privacy'
    }
  ];

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.mainTitle}>
            <span className={styles.aiText}>AI</span> Clinic Management
          </h1>
          <p className={styles.subtitle}>
            Intelligent Healthcare Management System
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.rolesSection}>
          <h2 className={styles.sectionTitle}>Select Your Role</h2>
          <p className={styles.sectionSubtitle}>
            Choose your role to continue
          </p>

          <div className={styles.rolesGrid}>
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <div
                  key={role.id}
                  className={`${styles.roleCard} ${styles.roleCardHover}`}
                  onClick={() => handleLoginClick(role.id)}
                >
                  <div className={`${styles.cardHeader} bg-gradient-to-r ${role.color}`}>
                    <div className={styles.roleIcon}>
                      <IconComponent size={56} />
                    </div>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <h3 className={`${styles.roleName} ${role.textColor}`}>
                      {role.name}
                    </h3>
                    <p className={styles.roleDescription}>
                      {role.description}
                    </p>
                  </div>

                  <div className={styles.cardFooter}>
                    <button className={styles.loginBtn}>
                      Login as {role.name}
                      <span className={styles.arrow}>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Why Choose Us?</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <IconComponent size={40} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 AI Clinic Management System. All rights reserved.</p>
          <button onClick={handleSignUp} className={styles.signUpLink}>
            New here? Create an account →
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;
