import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar, Stethoscope, Pill, Clock, Loader, FileCheck, TrendingUp } from 'lucide-react';
import api from '../Services/api';

const PatientPrescriptions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/prescriptions');
        setPrescriptions(res.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load prescriptions'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const handleDownload = async (id) => {
    try {
      setDownloading(id);
      // Open PDF in new tab
      window.open(`${import.meta.env.VITE_API_URL}/prescriptions/${id}/pdf`, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  // Calculate statistics
  const stats = {
    total: prescriptions.length,
    thisMonth: prescriptions.filter(p => {
      const prescriptionDate = new Date(p.createdAt);
      const now = new Date();
      return prescriptionDate.getMonth() === now.getMonth() &&
             prescriptionDate.getFullYear() === now.getFullYear();
    }).length,
    recent: prescriptions.filter(p => {
      const prescriptionDate = new Date(p.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return prescriptionDate >= weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Prescriptions</h1>
        <p className="text-gray-600">View and download your medical prescriptions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-6">
        {prescriptions.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-12 text-center border border-gray-100">
            <FileText className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-500">You haven't received any prescriptions yet.</p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription._id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg mr-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Prescription #{prescription._id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="mr-1" size={14} />
                        {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Stethoscope className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Doctor</p>
                          <p className="text-sm text-gray-900">Dr. {prescription.doctor?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{prescription.doctor?.specialization || 'General Physician'}</p>
                        </div>
                      </div>

                      {prescription.diagnosis && (
                        <div className="flex items-start">
                          <FileCheck className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Diagnosis</p>
                            <p className="text-sm text-gray-900">{prescription.diagnosis}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {prescription.medications && prescription.medications.length > 0 && (
                        <div className="flex items-start">
                          <Pill className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Medications</p>
                            <div className="space-y-1">
                              {prescription.medications.map((med, index) => (
                                <div key={index} className="text-sm text-gray-900">
                                  • {med.name} - {med.dosage}
                                  {med.frequency && ` (${med.frequency})`}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {prescription.notes && (
                        <div className="flex items-start">
                          <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Notes</p>
                            <p className="text-sm text-gray-900">{prescription.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-6">
                  <button
                    onClick={() => handleDownload(prescription._id)}
                    disabled={downloading === prescription._id}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {downloading === prescription._id ? (
                      <>
                        <Loader className="animate-spin mr-2" size={16} />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2" size={16} />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientPrescriptions;
