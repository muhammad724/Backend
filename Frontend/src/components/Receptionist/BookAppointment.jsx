import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../Services/api';

const BookAppointment = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '',
    symptoms: '',
    type: 'consultation',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsRes, usersRes] = await Promise.all([
          api.get('/patients'),
          api.get('/admin/users'),
        ]);

        setPatients(patientsRes.data?.patients || []);
        const allUsers = usersRes.data?.users || [];
        setDoctors(allUsers.filter((u) => u.role === 'doctor'));
      } catch {
        // Non-blocking for now
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        patient: form.patient,
        doctor: form.doctor,
        date: form.date,
        timeSlot: {
          start: form.time,
        },
        symptoms: form.symptoms
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        type: form.type,
      };

      await api.post('/appointments', payload);
      setMessage('Appointment booked successfully.');
      // Reset form after successful booking
      setForm({
        patient: '',
        doctor: '',
        date: '',
        time: '',
        symptoms: '',
        type: 'consultation',
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to book appointment'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book New Appointment</h1>
        <p className="text-gray-600">Schedule a new appointment for a patient</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Calendar className="mr-3" size={24} />
            Appointment Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <User className="mr-2" size={16} />
              Select Patient
            </label>
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              required
            >
              <option value="">Choose a patient...</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <Stethoscope className="mr-2" size={16} />
              Select Doctor
            </label>
            <select
              name="doctor"
              value={form.doctor}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              required
            >
              <option value="">Choose a doctor...</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.name} - {d.specialization || 'General Physician'}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Calendar className="mr-2" size={16} />
                Appointment Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Clock className="mr-2" size={16} />
                Appointment Time
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Symptoms (Optional)
            </label>
            <textarea
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
              placeholder="Enter symptoms separated by commas (e.g., fever, headache, cough)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
            <p className="text-xs text-gray-500">Separate multiple symptoms with commas</p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Booking Appointment...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={20} />
                  Book Appointment
                </>
              )}
            </button>
          </div>
        </form>

        {/* Messages */}
        {message && (
          <div className="mx-6 mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="text-green-500 mr-3" size={20} />
            <p className="text-green-800 font-medium">{message}</p>
          </div>
        )}

        {error && (
          <div className="mx-6 mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <XCircle className="text-red-500 mr-3" size={20} />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;

