import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../Services/api';
import { Calendar, Users, Clock, Search, Filter } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DoctorAppointments = () => {
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async (selectedDate) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/doctor/appointments/${selectedDate}`);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load appointments'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(date);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAppointments(date);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const statusStats = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const appointmentChartData = {
    labels: ['Scheduled', 'Completed', 'Cancelled', 'No-show'],
    datasets: [{
      label: 'Appointments',
      data: [
        statusStats.scheduled || statusStats.confirmed || 0,
        statusStats.completed || 0,
        statusStats.cancelled || 0,
        statusStats['no-show'] || 0
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(156, 163, 175, 0.8)',
      ],
      borderWidth: 1,
    }],
  };

  return (
    <div className="flex-1 p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>{appointments.length} Appointments</span>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-500" size={20} />
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:bg-blue-300"
          >
            <Search size={18} />
            <span>{loading ? 'Loading...' : 'Load Appointments'}</span>
          </button>
        </form>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Scheduled</p>
              <p className="text-3xl font-bold text-gray-900">{statusStats.scheduled || statusStats.confirmed || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{statusStats.completed || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Cancelled</p>
              <p className="text-3xl font-bold text-gray-900">{statusStats.cancelled || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <Filter size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Chart */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="mr-2 text-blue-500" size={20} />
          Appointment Status Distribution
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

      {/* Appointments Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Appointments for {new Date(date).toLocaleDateString()}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                    No appointments for this date.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {apt.patient?.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {apt.patient?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {apt.reason || 'General Checkup'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{apt.patient?.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{apt.patient?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                        apt.status === 'scheduled' || apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1) || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;

