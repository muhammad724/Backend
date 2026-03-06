import React, { useState } from 'react';
import { Brain, Thermometer, User, FileText, AlertTriangle, CheckCircle, XCircle, Loader, Zap, Heart } from 'lucide-react';
import api from '../Services/api';

const DoctorSymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [history, setHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!symptoms.trim()) {
      errors.symptoms = 'Please enter at least one symptom';
    } else {
      const symptomList = symptoms.split(',').map(s => s.trim()).filter(Boolean);
      if (symptomList.length === 0) {
        errors.symptoms = 'Please enter valid symptoms';
      }
    }

    if (age && (isNaN(age) || age < 0 || age > 150)) {
      errors.age = 'Please enter a valid age (0-150)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const payload = {
        symptoms: symptoms
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        age: Number(age) || undefined,
        gender,
        medicalHistory: history,
      };

      const res = await api.post('/ai/symptom-checker', payload);
      setResult(res.data.analysis || 'No analysis returned.');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Failed to run AI symptom checker. Ensure you have Pro subscription.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Brain className="mr-3 text-purple-600" size={32} />
          AI Symptom Checker
        </h1>
        <p className="text-gray-600">Advanced AI-powered symptom analysis for accurate diagnosis assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Thermometer className="mr-3" size={24} />
              Patient Assessment
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Symptoms */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <AlertTriangle className="mr-2" size={16} />
                Symptoms *
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Enter symptoms separated by commas (e.g., fever, cough, headache, fatigue)"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none ${
                  validationErrors.symptoms ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                rows="3"
                required
              />
              {validationErrors.symptoms && (
                <p className="text-sm text-red-600 flex items-center">
                  <XCircle className="mr-1" size={14} />
                  {validationErrors.symptoms}
                </p>
              )}
              <p className="text-xs text-gray-500">Separate multiple symptoms with commas</p>
            </div>

            {/* Age and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <User className="mr-2" size={16} />
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  min="0"
                  max="150"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
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
                  <Heart className="mr-2" size={16} />
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Medical History */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <FileText className="mr-2" size={16} />
                Medical History
              </label>
              <textarea
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                placeholder="Previous conditions, allergies, medications, surgeries..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                rows="3"
              />
              <p className="text-xs text-gray-500">Optional: Include relevant medical background</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2" size={20} />
                    Run AI Analysis
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <XCircle className="text-red-500 mr-3" size={20} />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <CheckCircle className="mr-3" size={24} />
                  AI Analysis Results
                </h2>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                      {result}
                    </pre>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <AlertTriangle className="text-blue-500 mr-3 mt-0.5" size={16} />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important Note:</p>
                      <p>This AI analysis is for reference only and should not replace professional medical judgment. Always consult with qualified healthcare providers for final diagnosis and treatment.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-xl rounded-2xl p-12 text-center border border-gray-100">
              <Brain className="mx-auto mb-4 text-gray-300" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analysis Ready</h3>
              <p className="text-gray-500">Fill out the patient assessment form and click "Run AI Analysis" to get intelligent symptom analysis and diagnosis suggestions.</p>
            </div>
          )}

          {/* Features Info */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="mr-2 text-purple-600" size={20} />
              AI Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="mr-2 text-green-500" size={14} />
                Symptom pattern recognition
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 text-green-500" size={14} />
                Age and gender considerations
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 text-green-500" size={14} />
                Medical history integration
              </li>
              <li className="flex items-center">
                <CheckCircle className="mr-2 text-green-500" size={14} />
                Differential diagnosis suggestions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSymptomChecker;

