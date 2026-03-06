import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../Services/api';
import { Calendar, Users, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp size={14} className="mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/doctor/dashboard');
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load doctor dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  const summary = data?.summary || {};
  const todaySchedule = data?.todaySchedule || [];
  const upcomingAppointments = data?.upcomingAppointments || [];
  const recentPrescriptions = data?.recentPrescriptions || [];
  const ageGroups = data?.ageGroups || [];

  // Dynamic Chart data
  const weeklyAppointmentsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Appointments',
      data: [
        summary.todayAppointments || 0,
        Math.floor(summary.monthlyAppointments / 30) || 0,
        Math.floor(summary.monthlyAppointments / 30) || 0,
        Math.floor(summary.monthlyAppointments / 30) || 0,
        Math.floor(summary.monthlyAppointments / 30) || 0,
        Math.floor(summary.monthlyAppointments / 30) || 0,
        Math.floor(summary.monthlyAppointments / 30) || 0
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  };

  const patientTrendData = {
    labels: ageGroups.map(group => {
      if (group._id === 'Other') return '70+';
      return `${group._id.min || 0}-${group._id.max || group._id}`;
    }) || ['0-18', '18-30', '30-50', '50-70', '70+'],
    datasets: [{
      label: 'Patients by Age Group',
      data: ageGroups.map(group => group.count) || [5, 8, 6, 10, 3],
      fill: false,
      borderColor: 'rgba(34, 197, 94, 1)',
      tension: 0.1,
    }],
  };

  return (
    <div className="flex-1 p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity size={16} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          trend="+3 this month"
        />
        <StatCard 
          label="Completion Rate" 
          value={`${summary.completionRate || 0}%`} 
          icon={CheckCircle} 
          color="bg-purple-500"
          trend="+5% this month"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Appointments */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2 text-blue-500" size={20} />
            This Week's Appointments
          </h2>
          <Bar 
            data={weeklyAppointmentsData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>

        {/* Patient Trend */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-500" size={20} />
            Patient Growth
          </h2>
          <Line 
            data={patientTrendData} 
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>
      </div>

      {/* Schedule Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="mr-2 text-blue-500" size={20} />
            Today's Schedule
          </h2>
          <div className="space-y-3">
            {data.todaySchedule?.length ? (
              data.todaySchedule.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient?.name}</p>
                    <p className="text-sm text-gray-600">{apt.reason || 'General Checkup'}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No appointments for today.</p>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2 text-green-500" size={20} />
            Upcoming Appointments
          </h2>
          <div className="space-y-3">
            {data.upcomingAppointments?.length ? (
              data.upcomingAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient?.name}</p>
                    <p className="text-sm text-gray-600">{apt.reason || 'General Checkup'}</p>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    {new Date(apt.date).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming appointments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

