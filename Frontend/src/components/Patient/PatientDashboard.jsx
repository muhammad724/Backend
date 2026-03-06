import React, { useEffect, useState } from 'react';
import api from '../Services/api';
import { Calendar, FileText, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/patient/dashboard');
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load patient dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const recentAppointments = data?.recentAppointments || [];
  const recentPrescriptions = data?.recentPrescriptions || [];

  return (
    <div className="flex-1 p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User size={16} />
          <span>Welcome back!</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Appointments" 
          value={summary.totalAppointments || 0} 
          icon={Calendar} 
          color="bg-blue-500"
        />
        <StatCard 
          label="Active Prescriptions" 
          value={summary.activePrescriptions || 0} 
          icon={FileText} 
          color="bg-green-500"
        />
        <StatCard 
          label="Upcoming Appointments" 
          value={summary.upcomingAppointments || 0} 
          icon={Clock} 
          color="bg-orange-500"
        />
        <StatCard 
          label="Completed Visits" 
          value={summary.completedVisits || 0} 
          icon={CheckCircle} 
          color="bg-purple-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2 text-blue-500" size={20} />
            Recent Appointments
          </h2>
          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent appointments.</p>
            ) : (
              recentAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div>
                    <p className="font-medium text-gray-900">Dr. {apt.doctor?.name}</p>
                    <p className="text-sm text-gray-600">{apt.reason || 'General Checkup'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {new Date(apt.date).toLocaleDateString()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {apt.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="mr-2 text-green-500" size={20} />
            Recent Prescriptions
          </h2>
          <div className="space-y-3">
            {recentPrescriptions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent prescriptions.</p>
            ) : (
              recentPrescriptions.map((prescription) => (
                <div key={prescription._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div>
                    <p className="font-medium text-gray-900">Dr. {prescription.doctor?.name}</p>
                    <p className="text-sm text-gray-600">{prescription.medications?.length || 0} medications</p>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <Calendar className="mr-2 text-blue-500" size={20} />
            <span className="font-medium text-blue-700">Book Appointment</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
            <FileText className="mr-2 text-green-500" size={20} />
            <span className="font-medium text-green-700">View Prescriptions</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
            <User className="mr-2 text-purple-500" size={20} />
            <span className="font-medium text-purple-700">Update Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;