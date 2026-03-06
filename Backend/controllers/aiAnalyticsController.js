import DiagnosisLog from '../models/DiagnosisLog.js';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

// @desc    Get AI usage statistics
// @route   GET /api/ai-analytics/usage
// @access  Private/Admin
export const getAIUsageStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await DiagnosisLog.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            modelUsed: "$aiModelUsed"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    const totalQueries = await DiagnosisLog.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const geminiQueries = await DiagnosisLog.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      aiModelUsed: "gemini"
    });

    const fallbackQueries = await DiagnosisLog.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      aiModelUsed: "fallback"
    });

    res.json({
      success: true,
      summary: {
        totalQueries,
        geminiQueries,
        fallbackQueries,
        successRate: totalQueries ? ((geminiQueries / totalQueries) * 100).toFixed(1) : 0
      },
      dailyStats: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get most common symptoms analyzed
// @route   GET /api/ai-analytics/common-symptoms
// @access  Private/Admin
export const getCommonSymptoms = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const symptoms = await DiagnosisLog.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: "$symptoms" },
      {
        $group: {
          _id: "$symptoms",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      commonSymptoms: symptoms
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get risk level distribution
// @route   GET /api/ai-analytics/risk-levels
// @access  Private/Admin
export const getRiskLevelDistribution = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const riskLevels = await DiagnosisLog.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$riskLevel",
          count: { $sum: 1 }
        }
      }
    ]);

    const total = riskLevels.reduce((acc, curr) => acc + curr.count, 0);

    res.json({
      success: true,
      distribution: riskLevels,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI accuracy feedback
// @route   GET /api/ai-analytics/accuracy
// @access  Private/Admin
export const getAIAccuracy = async (req, res) => {
  try {
    const feedback = await DiagnosisLog.aggregate([
      {
        $match: {
          "accuracy.doctorFeedback": { $exists: true }
        }
      },
      {
        $group: {
          _id: "$accuracy.doctorFeedback",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI recommendations summary
// @route   GET /api/ai-analytics/recommendations
// @access  Private/Admin
export const getAIRecommendations = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // This is a simplified version - in production you might want to parse AI responses
    const recommendations = await DiagnosisLog.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          riskLevel: "high"
        }
      },
      {
        $group: {
          _id: "$patient",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    await DiagnosisLog.populate(recommendations, { path: "_id", select: "name" });

    res.json({
      success: true,
      highRiskPatients: recommendations.map(r => ({
        patient: r._id,
        riskCount: r.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};