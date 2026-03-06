import React, { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../Services/api';
import { Users, Stethoscope, Calendar, TrendingUp, Activity, Clock } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
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

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/admin/dashboard');
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load admin dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const summary = data?.summary || {};
  const recentAppointments = data?.recentData?.recentAppointments || [];
  const recentPatients = data?.recentData?.recentPatients || [];
  const charts = data?.charts || {};

  // Dynamic Chart data
  const appointmentChartData = {
    labels: charts.monthlyTrend?.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[item._id.month - 1] + ' ' + item._id.year;
    }) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Appointments',
      data: charts.monthlyTrend?.map(item => item.count) || [12, 19, 15, 25, 22, 8],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  };

  const userDistributionData = {
    labels: ['Patients', 'Doctors', 'Receptionists'],
    datasets: [{
      data: [summary.totalPatients || 0, summary.totalDoctors || 0, summary.totalReceptionists || 0],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderWidth: 1,
    }],
  };

  const appointmentTrendData = {
    labels: charts.monthlyTrend?.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[item._id.month - 1] + ' ' + item._id.year;
    }) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Appointments',
      data: charts.monthlyTrend?.map(item => item.count) || [65, 59, 80, 81, 56, 85],
      fill: false,
      borderColor: 'rgba(75, 192, 192, 1)',
      tension: 0.1,
    }],
  };

  return (
    <div className="flex-1 p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity size={16} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Patients" 
          value={summary.totalPatients || 0} 
          icon={Users} 
          color="bg-green-500"
          trend="+12% this month"
        />
        <StatCard 
          label="Active Doctors" 
          value={summary.totalDoctors || 0} 
          icon={Stethoscope} 
          color="bg-blue-500"
          trend="+2 this week"
        />
        <StatCard 
          label="Receptionists" 
          value={summary.totalReceptionists || 0} 
          icon={Users} 
          color="bg-orange-500"
        />
        <StatCard 
          label="Total Appointments" 
          value={summary.totalAppointments || 0} 
          icon={Calendar} 
          color="bg-purple-500"
          trend="+8% this month"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Trend */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-500" size={20} />
            Appointment Trends
          </h2>
          <Line 
            data={appointmentTrendData} 
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

        {/* User Distribution */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 text-green-500" size={20} />
            User Distribution
          </h2>
          <Doughnut 
            data={userDistributionData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' },
              },
            }}
          />
        </div>
      </div>

      {/* Weekly Appointments Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="mr-2 text-purple-500" size={20} />
          Weekly Appointments
        </h2>
        <Bar 
          data={appointmentChartData}
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="mr-2 text-blue-500" size={20} />
            Recent Appointments
          </h2>
          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent appointments.</p>
            ) : (
              recentAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient?.name}</p>
                    <p className="text-sm text-gray-600">with Dr. {apt.doctor?.name}</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                    {new Date(apt.date).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 text-green-500" size={20} />
            Recent Patients
          </h2>
          <div className="space-y-3">
            {recentPatients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent patients.</p>
            ) : (
              recentPatients.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-600">{p.email}</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

