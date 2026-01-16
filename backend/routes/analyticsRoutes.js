const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getPerformanceMetrics,
  getClientInsights,
  exportAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/performance', getPerformanceMetrics);
router.get('/clients', getClientInsights);
router.get('/export', exportAnalytics);

module.exports = router;
