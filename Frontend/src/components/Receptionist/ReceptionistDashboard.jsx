import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../Services/api';
import { Users, Calendar, Clock, Plus, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

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

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/receptionist/dashboard');
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load receptionist dashboard data'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
  const todayAppointments = data?.todayAppointments || [];
  const pendingTasks = data?.pendingTasks || [];

  return (
    <div className="flex-1 p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Receptionist Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users size={16} />
          <span>Today's Overview</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Today's Appointments" 
          value={summary.todayAppointments || 0} 
          icon={Calendar} 
          color="bg-blue-500"
        />
        <StatCard 
          label="Total Patients" 
          value={summary.totalPatients || 0} 
          icon={Users} 
          color="bg-green-500"
        />
        <StatCard 
          label="Pending Tasks" 
          value={summary.pendingTasks || 0} 
          icon={Clock} 
          color="bg-orange-500"
        />
        <StatCard 
          label="Completed Today" 
          value={summary.completedToday || 0} 
          icon={CheckCircle} 
          color="bg-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/receptionist/book-appointment')}
            className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Plus className="mr-2 text-blue-500" size={20} />
            <span className="font-medium text-blue-700">Book Appointment</span>
          </button>
          <button 
            onClick={() => navigate('/receptionist/register-patient')}
            className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <UserPlus className="mr-2 text-green-500" size={20} />
            <span className="font-medium text-green-700">Register Patient</span>
          </button>
          <button 
            onClick={() => navigate('/receptionist/schedule')}
            className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
          >
            <Calendar className="mr-2 text-orange-500" size={20} />
            <span className="font-medium text-orange-700">View Schedule</span>
          </button>
          <button 
            onClick={() => navigate('/patients')}
            className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
          >
            <Users className="mr-2 text-purple-500" size={20} />
            <span className="font-medium text-purple-700">Patient Search</span>
          </button>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="mr-2 text-blue-500" size={20} />
          Today's Appointments
        </h2>
        <div className="space-y-3">
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No appointments scheduled for today.</p>
          ) : (
            todayAppointments.map((apt) => (
              <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient?.name}</p>
                    <p className="text-sm text-gray-600">Dr. {apt.doctor?.name}</p>
                    <p className="text-xs text-gray-500">{apt.reason || 'General Checkup'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded">
                    {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {apt.status === 'confirmed' ? 'Confirmed' : apt.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="mr-2 text-orange-500" size={20} />
            Pending Tasks
          </h2>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;