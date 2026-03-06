import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Home from './components/Home/Home.jsx';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import Sidebar from './components/Layout/Sidebar.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import AdminUsers from './components/Admin/AdminUsers.jsx';
import DoctorDashboard from './components/Doctor/DoctorDashboard.jsx';
import DoctorAppointments from './components/Doctor/DoctorAppointments.jsx';
import DoctorPatients from './components/Doctor/DoctorPatients.jsx';
import DoctorSymptomChecker from './components/Doctor/DoctorSymptomChecker.jsx';
import DoctorPrescriptions from './components/Doctor/DoctorPrescriptions.jsx';
import ReceptionistDashboard from './components/Receptionist/ReceptionistDashboard.jsx';
import RegisterPatient from './components/Receptionist/RegisterPatient.jsx';
import BookAppointment from './components/Receptionist/BookAppointment.jsx';
import DailySchedule from './components/Receptionist/DailySchedule.jsx';
import PatientDashboard from './components/Patient/PatientDashboard.jsx';
import PatientAppointments from './components/Patient/PatientAppointments.jsx';
import PatientPrescriptions from './components/Patient/PatientPrescriptions.jsx';
import PatientProfile from './components/Patient/PatientProfile.jsx';

const ShellLayout = ({ children }) => (
  <div className="min-h-screen flex bg-gray-100">
    <Sidebar />
    <main className="flex-1">{children}</main>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

function App() {
  const { user, isAuthenticated } = useAuth();

  const getDefaultDashboard = () => {
    if (!isAuthenticated || !user?.role) return '/login';
    return `/${user.role}/dashboard`;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin area */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ShellLayout>
              <AdminDashboard />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ShellLayout>
              <AdminUsers />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/receptionists"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ShellLayout>
              <AdminUsers />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscriptions"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ShellLayout>
              <AdminUsers />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ShellLayout>
              <AdminDashboard />
            </ShellLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor area */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <ShellLayout>
              <DoctorDashboard />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <ShellLayout>
              <DoctorAppointments />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <ShellLayout>
              <DoctorPatients />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <ShellLayout>
              <DoctorPrescriptions />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/ai-symptom-checker"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <ShellLayout>
              <DoctorSymptomChecker />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/analytics"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <ShellLayout>
              <DoctorDashboard />
            </ShellLayout>
          </ProtectedRoute>
        }
      />

      {/* Receptionist area */}
      <Route
        path="/receptionist/dashboard"
        element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <ShellLayout>
              <ReceptionistDashboard />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/register-patient"
        element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <ShellLayout>
              <RegisterPatient />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/book-appointment"
        element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <ShellLayout>
              <BookAppointment />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/schedule"
        element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <ShellLayout>
              <DailySchedule />
            </ShellLayout>
          </ProtectedRoute>
        }
      />

      {/* Patient area */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <ShellLayout>
              <PatientDashboard />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <ShellLayout>
              <PatientAppointments />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/prescriptions"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <ShellLayout>
              <PatientPrescriptions />
            </ShellLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <ShellLayout>
              <PatientProfile />
            </ShellLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={getDefaultDashboard()} replace />} />
    </Routes>
  );
}

export default App;
