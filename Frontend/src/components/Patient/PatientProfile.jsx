import React, { useEffect, useState } from 'react';
import api from '../Services/api';

const PatientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    contact: '',
    bloodGroup: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/patients/me');
        const data = res.data;
        setForm({
          name: data.name || '',
          email: data.email || '',
          age: data.age || '',
          gender: data.gender || '',
          contact: data.contact || '',
          bloodGroup: data.bloodGroup || ''
        });
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load profile'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.put('/patients/me', form);
      setMessage('Profile updated successfully.');
      setForm(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update profile'
      );
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="flex-1 p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact</label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Blood Group</label>
          <input
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </form>
      {message && <div className="mt-3 text-green-600 text-sm">{message}</div>}
      {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
    </div>
  );
};

export default PatientProfile;
