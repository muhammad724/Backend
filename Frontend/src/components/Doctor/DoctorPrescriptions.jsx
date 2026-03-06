import React, { useEffect, useState } from 'react';
import { FileText, User, Stethoscope, Pill, TestTube, FileCheck, Calendar, CheckCircle, XCircle, Loader, Plus, BarChart3 } from 'lucide-react';
import api from '../Services/api';

const DoctorPrescriptions = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [prescriptionStats, setPrescriptionStats] = useState({ total: 0, thisMonth: 0 });
  const [form, setForm] = useState({
    patient: '',
    diagnosis: '',
    medicines: '', // comma separated
    tests: '', // comma separated
    notes: '',
    followUpDate: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsRes, statsRes] = await Promise.all([
          api.get('/doctor/patients'),
          api.get('/doctor/prescriptions/stats')
        ]);
        setPatients(patientsRes.data.patients || []);
        setPrescriptionStats(statsRes.data || { total: 0, thisMonth: 0 });
      } catch {
        // ignore for now
      }
    };
    loadData();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!form.patient) {
      errors.patient = 'Please select a patient';
    }

    if (!form.diagnosis.trim()) {
      errors.diagnosis = 'Diagnosis is required';
    } else if (form.diagnosis.trim().length < 5) {
      errors.diagnosis = 'Diagnosis must be at least 5 characters';
    }

    if (form.followUpDate && new Date(form.followUpDate) <= new Date()) {
      errors.followUpDate = 'Follow-up date must be in the future';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const payload = {
        patient: form.patient,
        diagnosis: form.diagnosis,
        medicines: form.medicines
          .split(',')
          .map((m) => ({ name: m.trim() }))
          .filter((m) => m.name),
        tests: form.tests
          .split(',')
          .map((t) => ({ name: t.trim() }))
          .filter((t) => t.name),
        notes: form.notes,
        followUpDate: form.followUpDate || undefined
      };

      await api.post('/prescriptions', payload);
      setMessage('Prescription created successfully.');

      // Update stats
      setPrescriptionStats(prev => ({
        ...prev,
        total: prev.total + 1,
        thisMonth: prev.thisMonth + 1
      }));

      setForm({
        patient: '',
        diagnosis: '',
        medicines: '',
        tests: '',
        notes: '',
        followUpDate: ''
      });
      setValidationErrors({});
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create prescription'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Prescription</h1>
        <p className="text-gray-600">Create and manage patient prescriptions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{prescriptionStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{prescriptionStats.thisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prescription Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Plus className="mr-3" size={24} />
                New Prescription
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <User className="mr-2" size={16} />
                  Select Patient *
                </label>
                <select
                  name="patient"
                  value={form.patient}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white ${
                    validationErrors.patient ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Choose a patient...</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {validationErrors.patient && (
                  <p className="text-sm text-red-600 flex items-center">
                    <XCircle className="mr-1" size={14} />
                    {validationErrors.patient}
                  </p>
                )}
              </div>

              {/* Diagnosis */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <Stethoscope className="mr-2" size={16} />
                  Diagnosis *
                </label>
                <textarea
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleChange}
                  placeholder="Describe the patient's diagnosis..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                    validationErrors.diagnosis ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  rows="3"
                  required
                />
                {validationErrors.diagnosis && (
                  <p className="text-sm text-red-600 flex items-center">
                    <XCircle className="mr-1" size={14} />
                    {validationErrors.diagnosis}
                  </p>
                )}
              </div>

              {/* Medicines */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <Pill className="mr-2" size={16} />
                  Medicines
                </label>
                <input
                  name="medicines"
                  value={form.medicines}
                  onChange={handleChange}
                  placeholder="Paracetamol 500mg, Ibuprofen 200mg, Amoxicillin 500mg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500">Separate multiple medicines with commas</p>
              </div>

              {/* Tests */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <TestTube className="mr-2" size={16} />
                  Tests
                </label>
                <input
                  name="tests"
                  value={form.tests}
                  onChange={handleChange}
                  placeholder="Blood test, X-ray chest, ECG, Ultrasound"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500">Separate multiple tests with commas</p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <FileCheck className="mr-2" size={16} />
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any additional instructions or notes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows="2"
                />
              </div>

              {/* Follow-up Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <Calendar className="mr-2" size={16} />
                  Follow-up Date
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    validationErrors.followUpDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.followUpDate && (
                  <p className="text-sm text-red-600 flex items-center">
                    <XCircle className="mr-1" size={14} />
                    {validationErrors.followUpDate}
                  </p>
                )}
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
                      Creating Prescription...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={20} />
                      Create Prescription
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

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="mr-2" size={20} />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Patients</span>
                <span className="font-semibold text-gray-900">{patients.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prescriptions Today</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Reviews</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Always include clear diagnosis</li>
              <li>• Specify medicine dosages</li>
              <li>• Set appropriate follow-up dates</li>
              <li>• Add notes for special instructions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescriptions;
