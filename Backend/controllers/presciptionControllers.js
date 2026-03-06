import Prescription from '../Model/PrescriptionModel.js';
import Patient from '../Model/patientModel.js';
import Appointment from '../Model/AppointmentModel.js';
import PDFDocument from 'pdfkit';

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
export const createPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.create({
      ...req.body,
      doctor: req.user._id
    });

    // Update appointment if linked
    if (req.body.appointment) {
      await Appointment.findByIdAndUpdate(req.body.appointment, {
        prescription: prescription._id,
        status: 'completed'
      });
    }

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'name age gender contact')
      .populate('doctor', 'name specialization');

    res.status(201).json(populatedPrescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ email: req.user.email });
      if (patient) {
        query.patient = patient._id;
      }
    }

    // Filter by patient
    if (req.query.patientId) {
      query.patient = req.query.patientId;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name age gender')
      .populate('doctor', 'name specialization')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'name specialization email')
      .populate('appointment');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private/Doctor
export const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private/Admin
export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient prescriptions
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
export const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      patient: req.params.patientId 
    })
      .populate('doctor', 'name specialization')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate prescription PDF
// @route   GET /api/prescriptions/:id/pdf
// @access  Private
export const generatePrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('doctor');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('MEDICAL PRESCRIPTION', { align: 'center' });
    doc.moveDown();
    
    // Clinic Info
    doc.fontSize(10).text('AI Clinic Management System', { align: 'center' });
    doc.text('123 Healthcare Street, Medical City', { align: 'center' });
    doc.text('Phone: +92 123 456789 | Email: clinic@example.com', { align: 'center' });
    doc.moveDown();

    // Draw line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Patient & Doctor Info
    doc.fontSize(12);
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
    doc.text(`Prescription #: ${prescription.prescriptionId || prescription._id}`);
    doc.moveDown();
    
    doc.text(`Patient Name: ${prescription.patient.name}`);
    doc.text(`Age: ${prescription.patient.age} | Gender: ${prescription.patient.gender}`);
    doc.text(`Patient Contact: ${prescription.patient.contact}`);
    doc.moveDown();
    
    doc.text(`Doctor: Dr. ${prescription.doctor.name}`);
    doc.text(`Specialization: ${prescription.doctor.specialization || 'General Physician'}`);
    doc.moveDown();

    // Draw line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Diagnosis
    doc.fontSize(14).text('DIAGNOSIS', { underline: true });
    doc.fontSize(12).text(prescription.diagnosis);
    doc.moveDown();

    // Medicines
    if (prescription.medicines && prescription.medicines.length > 0) {
      doc.fontSize(14).text('PRESCRIBED MEDICINES', { underline: true });
      doc.moveDown();
      
      prescription.medicines.forEach((med, i) => {
        doc.fontSize(12).text(`${i+1}. ${med.name} - ${med.dosage || ''}`);
        doc.fontSize(10).text(`   ${med.frequency || ''} ${med.duration ? 'for ' + med.duration : ''}`);
        if (med.instructions) {
          doc.fontSize(9).text(`   Note: ${med.instructions}`);
        }
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Tests
    if (prescription.tests && prescription.tests.length > 0) {
      doc.fontSize(14).text('RECOMMENDED TESTS', { underline: true });
      doc.moveDown();
      
      prescription.tests.forEach((test, i) => {
        doc.fontSize(12).text(`${i+1}. ${test.name}`);
        if (test.instructions) {
          doc.fontSize(10).text(`   ${test.instructions}`);
        }
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Notes
    if (prescription.notes) {
      doc.fontSize(14).text('ADDITIONAL NOTES', { underline: true });
      doc.fontSize(12).text(prescription.notes);
      doc.moveDown();
    }

    // Follow-up
    if (prescription.followUpDate) {
      doc.fontSize(12).text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString()}`);
    }

    // AI Explanation
    if (prescription.aiExplanation) {
      doc.moveDown();
      doc.fontSize(10).text('AI Generated Explanation:', { italic: true });
      doc.fontSize(9).text(prescription.aiExplanation, { italic: true });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('This is a computer generated prescription. No signature required.', { align: 'center', italic: true });
    doc.text('Valid only with doctor\'s verification.', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add medicine to prescription
// @route   POST /api/prescriptions/:id/medicines
// @access  Private/Doctor
export const addMedicine = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.medicines.push(req.body);
    await prescription.save();

    res.status(201).json(prescription.medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove medicine from prescription
// @route   DELETE /api/prescriptions/:id/medicines/:medicineId
// @access  Private/Doctor
export const removeMedicine = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.medicines = prescription.medicines.filter(
      med => med._id.toString() !== req.params.medicineId
    );
    await prescription.save();

    res.json({ message: 'Medicine removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add test to prescription
// @route   POST /api/prescriptions/:id/tests
// @access  Private/Doctor
export const addTest = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.tests.push(req.body);
    await prescription.save();

    res.status(201).json(prescription.tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};