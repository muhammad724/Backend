import React, { useState } from 'react';
import { User, Mail, Calendar, Phone, Users, CheckCircle, XCircle, Loader, UserPlus } from 'lucide-react';
import api from '../Services/api';

const RegisterPatient = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'male',
    contact: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (form.age && (isNaN(form.age) || form.age < 0 || form.age > 150)) {
      errors.age = 'Please enter a valid age (0-150)';
    }

    if (form.contact && !/^\+?[\d\s\-\(\)]+$/.test(form.contact)) {
      errors.contact = 'Please enter a valid contact number';
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

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/patients', {
        ...form,
        age: form.age ? Number(form.age) : undefined,
      });
      setMessage('Patient registered successfully.');
      setForm({
        name: '',
        email: '',
        age: '',
        gender: 'male',
        contact: '',
      });
      setValidationErrors({});
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to register patient'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Patient</h1>
        <p className="text-gray-600">Add a new patient to the system</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <UserPlus className="mr-3" size={24} />
            Patient Information
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <User className="mr-2" size={16} />
              Full Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter patient's full name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                validationErrors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              required
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600 flex items-center">
                <XCircle className="mr-1" size={14} />
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 flex items-center">
              <Mail className="mr-2" size={16} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="patient@example.com"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                validationErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-600 flex items-center">
                <XCircle className="mr-1" size={14} />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Age, Gender, Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Calendar className="mr-2" size={16} />
                Age
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="25"
                min="0"
                max="150"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  validationErrors.age ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.age && (
                <p className="text-sm text-red-600 flex items-center">
                  <XCircle className="mr-1" size={14} />
                  {validationErrors.age}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Users className="mr-2" size={16} />
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Phone className="mr-2" size={16} />
                Contact Number
              </label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  validationErrors.contact ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.contact && (
                <p className="text-sm text-red-600 flex items-center">
                  <XCircle className="mr-1" size={14} />
                  {validationErrors.contact}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Registering Patient...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2" size={20} />
                  Register Patient
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

export default RegisterPatient;

