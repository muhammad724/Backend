import Diagnosis from '../Model/DigonseModel.js';
import Patient from '../Model/patientModel.js';
import Prescription from '../Model/PrescriptionModel.js';
import { GoogleGenAI } from "@google/genai";
import Appointment from '../Model/AppointmentModel.js';

// Lazy-load GoogleGenAI - instantiate only when needed
let ai = null;

const getAIClient = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  return ai;
};

// @desc    Check symptoms using AI
// @route   POST /api/ai/symptom-checker
// @access  Private/Doctor (Pro subscription required)
export const checkSymptoms = async (req, res) => {
  try {
    const { symptoms, age, gender, medicalHistory, patientId } = req.body;

    // Check if user has Pro subscription
    if (req.user.subscriptionPlan !== 'pro') {
      return res.status(403).json({ 
        message: 'AI features require Pro subscription',
        fallback: true 
      });
    }

    let aiResponse;
    let aiModelUsed = 'gemini';

    try {
      const prompt = `As a medical AI assistant, analyze these symptoms and provide possible conditions.
      
      Patient Information:
      - Symptoms: ${symptoms.join(', ')}
      - Age: ${age}
      - Gender: ${gender}
      - Medical History: ${medicalHistory || 'None'}
      
      Please provide:
      1. Possible conditions (list top 3)
      2. Risk level for each (Low/Medium/High)
      3. Suggested tests
      4. General recommendations
      
      Format the response in a clear, structured way.`;

      const result = await getAIClient().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      aiModelUsed = 'fallback';
      
      // Simple fallback response
      aiResponse = `Based on the symptoms provided (${symptoms.join(', ')}), 
      here are some general recommendations:
      
      1. Common conditions to consider: Viral infection, Common cold, Seasonal allergies
      2. Risk level: Low to Medium (based on basic symptoms)
      3. Suggested tests: Complete Blood Count (CBC), Basic Metabolic Panel
      4. Recommendations: Rest, hydrate, monitor symptoms, consult with doctor if symptoms persist
      
      Note: This is an AI-generated suggestion. Please consult with a healthcare provider for proper diagnosis.`;
    }

    // Save diagnosis log
    const diagnosisLog = await Diagnosis.create({
      patient: patientId,
      doctor: req.user._id,
      symptoms,
      patientInfo: { age, gender },
      medicalHistory,
      aiResponse: { text: aiResponse },
      aiModelUsed,
      riskLevel: 'medium'
    });

    res.json({
      success: true,
      analysis: aiResponse,
      logId: diagnosisLog._id,
      modelUsed: aiModelUsed
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Explain prescription in simple terms
// @route   POST /api/ai/explain-prescription
// @access  Private (Pro subscription required)
export const explainPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.body;

    // Check subscription
    if (req.user.subscriptionPlan !== 'pro') {
      return res.status(403).json({ 
        message: 'AI features require Pro subscription' 
      });
    }

    // Get prescription
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patient')
      .populate('doctor');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    let explanation;
    let modelUsed = 'gemini';

    try {
      // Prepare medicine list
      const medicinesList = prescription.medicines.map(m => 
        `${m.name} - ${m.dosage} ${m.frequency}`
      ).join(', ');

      const prompt = `Explain this prescription in simple terms for the patient:
      
      Diagnosis: ${prescription.diagnosis}
      Medicines: ${medicinesList}
      
      Please explain:
      1. What each medicine does
      2. When and how to take them
      3. Possible side effects
      4. Precautions to take
      5. Lifestyle recommendations`;

      const result = await getAIClient().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      explanation = result?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate explanation";
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      modelUsed = 'fallback';
      
      // Simple fallback explanation
      explanation = `This prescription is for treating ${prescription.diagnosis}. 
      Take all medicines as directed by your doctor. 
      If you experience any side effects, contact your doctor immediately.`;
    }

    // Save explanation to prescription
    prescription.aiExplanation = explanation;
    await prescription.save();

    res.json({
      success: true,
      explanation,
      modelUsed
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Detect risks from patient history
// @route   GET /api/ai/risk-flags/:patientId
// @access  Private/Doctor (Pro subscription required)
export const detectRisks = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check subscription
    if (req.user.subscriptionPlan !== 'pro') {
      return res.status(403).json({ 
        message: 'AI features require Pro subscription' 
      });
    }

    // Get patient data
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get patient's medical history
    const prescriptions = await Prescription.find({ patient: patientId })
      .sort('-createdAt')
      .limit(10);

    const appointments = await Appointment.find({ patient: patientId })
      .sort('-date')
      .limit(10);

    const diagnosisLogs = await Diagnosis.find({ patient: patientId })
      .sort('-createdAt')
      .limit(10);

    let riskAnalysis;
    let modelUsed = 'gemini';

    try {
      // Prepare data for AI
      const conditions = prescriptions.map(p => p.diagnosis).join(', ');
      const symptoms = diagnosisLogs.flatMap(d => d.symptoms).join(', ');
      const visitFrequency = appointments.length;

      const prompt = `Analyze this patient's medical history for risk patterns:
      
      Patient: Age ${patient.age}, ${patient.gender}
      Allergies: ${patient.allergies?.join(', ') || 'None'}
      Medical History: ${patient.medicalHistory?.map(h => h.condition).join(', ') || 'None'}
      
      Recent Diagnoses: ${conditions}
      Recent Symptoms: ${symptoms}
      Visit Frequency: ${visitFrequency} visits in recent period
      
      Identify:
      1. Repeated infection patterns
      2. Chronic symptoms
      3. High-risk combinations
      4. Need for specialist referral
      5. Preventive recommendations`;

      const result = await getAIClient().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      riskAnalysis = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis available";
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      modelUsed = 'fallback';
      
      // Simple risk detection
      const risks = [];
      
      // Check for repeated diagnoses
      const diagnosisCount = {};
      prescriptions.forEach(p => {
        diagnosisCount[p.diagnosis] = (diagnosisCount[p.diagnosis] || 0) + 1;
      });
      
      Object.entries(diagnosisCount).forEach(([diagnosis, count]) => {
        if (count > 2) {
          risks.push(`Repeated occurrence of ${diagnosis} detected`);
        }
      });

      riskAnalysis = {
        risks: risks.length ? risks : ['No significant risk patterns detected'],
        recommendations: [
          'Regular health checkups recommended',
          'Maintain healthy lifestyle',
          'Follow prescribed treatments'
        ]
      };
    }

    res.json({
      success: true,
      patient: patient.name,
      risks: riskAnalysis,
      modelUsed
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get predictive analytics
// @route   GET /api/ai/predictive-analytics
// @access  Private/Admin,Doctor (Pro subscription required)
export const getPredictiveAnalytics = async (req, res) => {
  try {
    // Check subscription
    if (req.user.subscriptionPlan !== 'pro') {
      return res.status(403).json({ 
        message: 'Predictive analytics require Pro subscription' 
      });
    }

    // Get historical data (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const prescriptions = await Prescription.find({
      createdAt: { $gte: threeMonthsAgo }
    });

    const appointments = await Appointment.find({
      date: { $gte: threeMonthsAgo }
    });

    const patients = await Patient.find({
      createdAt: { $gte: threeMonthsAgo }
    });

    let predictions;
    let modelUsed = 'gemini';

    try {
      // Count diagnoses
      const diagnosisCount = {};
      prescriptions.forEach(p => {
        diagnosisCount[p.diagnosis] = (diagnosisCount[p.diagnosis] || 0) + 1;
      });

      // Get top diagnoses
      const topDiagnoses = Object.entries(diagnosisCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([d, c]) => `${d} (${c} cases)`);

      // Calculate averages
      const avgDailyAppointments = appointments.length / 90;
      const projectedAppointments = Math.round(avgDailyAppointments * 30);

      const prompt = `Based on this clinic data, provide predictive analytics:
      
      Last 3 months statistics:
      - Total patients: ${patients.length}
      - Total appointments: ${appointments.length}
      - Total prescriptions: ${prescriptions.length}
      - Average daily appointments: ${avgDailyAppointments.toFixed(1)}
      
      Top diagnoses:
      ${topDiagnoses.join('\n')}
      
      Predict for next month:
      1. Most common diseases expected
      2. Expected patient load
      3. Busiest days/times
      4. Resource recommendations
      5. Revenue forecast (simulated)`;

      const result = await getAIClient().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      predictions = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No predictions available";
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      modelUsed = 'fallback';
      
      // Count diagnoses for fallback
      const diagnosisCount = {};
      prescriptions.forEach(p => {
        diagnosisCount[p.diagnosis] = (diagnosisCount[p.diagnosis] || 0) + 1;
      });
      
      const topDiagnoses = Object.entries(diagnosisCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([d]) => d);

      const avgDailyAppointments = appointments.length / 90;
      const projectedAppointments = Math.round(avgDailyAppointments * 30);

      // Simple statistical predictions
      predictions = {
        expectedCommonDiseases: topDiagnoses,
        expectedPatientLoad: `${projectedAppointments} appointments next month`,
        busyDays: ['Monday', 'Tuesday'],
        recommendations: [
          'Schedule more staff on Mondays',
          'Stock common medicines',
          'Prepare for seasonal illnesses'
        ],
        revenueForecast: `Estimated revenue: PKR ${projectedAppointments * 1500}`
      };
    }

    res.json({
      success: true,
      predictions,
      modelUsed,
      summary: {
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        projectedAppointments
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI diagnosis history
// @route   GET /api/ai/diagnosis-history
// @access  Private/Doctor
export const getAIDiagnosisHistory = async (req, res) => {
  try {
    const logs = await Diagnosis.find({ doctor: req.user._id })
      .populate('patient', 'name age')
      .sort('-createdAt')
      .limit(50);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get risk flags summary
// @route   GET /api/ai/risk-flags
// @access  Private/Admin,Doctor
export const getRiskFlags = async (req, res) => {
  try {
    // Get all high-risk patients
    const highRiskDiagnoses = await Diagnosis.find({ 
      riskLevel: 'high',
      createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
    })
      .populate('patient', 'name age contact')
      .populate('doctor', 'name')
      .limit(20);

    res.json({
      total: highRiskDiagnoses.length,
      patients: highRiskDiagnoses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};