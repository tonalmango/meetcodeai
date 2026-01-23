const Quote = require('../models/Quote');
const Contact = require('../models/Contact');
const Project = require('../models/Project');
const Payment = require('../models/Payment');

// @desc    Get comprehensive analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Quotes Analytics
    const quoteStats = await Quote.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$quoteAmount' }
        }
      }
    ]);
    
    const totalQuotes = await Quote.countDocuments(dateFilter);
    const avgQuoteValue = await Quote.aggregate([
      { $match: { ...dateFilter, quoteAmount: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$quoteAmount' } } }
    ]);
    
    // Service popularity
    const serviceStats = await Quote.aggregate([
      { $match: dateFilter },
      { $unwind: '$services' },
      {
        $group: {
          _id: '$services',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Monthly trends
    const monthlyTrends = await Quote.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          quotes: { $sum: 1 },
          value: { $sum: '$quoteAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Projects Analytics
    const projectStats = await Project.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget.total' }
        }
      }
    ]);
    
    const activeProjects = await Project.countDocuments({
      ...dateFilter,
      status: { $in: ['planning', 'in-progress', 'review', 'revisions'] }
    });
    
    // Revenue Analytics
    const revenueStats = await Payment.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' }
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    
    // Contact Analytics
    const contactStats = await Contact.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Conversion rate (quotes to projects)
    const quotesAccepted = await Quote.countDocuments({ status: 'accepted' });
    const conversionRate = totalQuotes > 0 ? (quotesAccepted / totalQuotes) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        overview: {
          totalQuotes,
          activeProjects,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          averageQuoteValue: avgQuoteValue[0]?.avg || 0,
          conversionRate: conversionRate.toFixed(2)
        },
        quotes: {
          byStatus: quoteStats,
          byService: serviceStats,
          monthlyTrends
        },
        projects: {
          byStatus: projectStats
        },
        revenue: {
          total: revenueStats[0]?.totalRevenue || 0,
          transactions: revenueStats[0]?.count || 0,
          monthly: monthlyRevenue
        },
        contacts: {
          byStatus: contactStats
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data',
      error: error.message
    });
  }
};

// @desc    Get performance metrics
// @route   GET /api/analytics/performance
// @access  Private
exports.getPerformanceMetrics = async (req, res) => {
  try {
    // Response time by status
    const avgResponseTime = await Quote.aggregate([
      {
        $match: {
          updatedAt: { $ne: '$createdAt' } // Only quotes that have been updated
        }
      },
      {
        $project: {
          responseTime: {
            $subtract: ['$updatedAt', '$createdAt']
          },
          status: 1
        }
      },
      {
        $group: {
          _id: '$status',
          avgResponseTime: { $avg: '$responseTime' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Project completion rate
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const totalProjects = await Project.countDocuments();
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    
    // Average project duration
    const projectDurations = await Project.aggregate([
      {
        $match: {
          status: 'completed',
          'timeline.actualCompletion': { $exists: true },
          'timeline.startDate': { $exists: true }
        }
      },
      {
        $project: {
          duration: {
            $subtract: ['$timeline.actualCompletion', '$timeline.startDate']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        quoteResponseTime: avgResponseTime,
        projectCompletionRate: completionRate.toFixed(2),
        avgProjectDuration: projectDurations[0]?.avgDuration || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching performance metrics',
      error: error.message
    });
  }
};

// @desc    Get client insights
// @route   GET /api/analytics/clients
// @access  Private
exports.getClientInsights = async (req, res) => {
  try {
    // Top clients by project count
    const topClients = await Project.aggregate([
      {
        $group: {
          _id: '$client.email',
          name: { $first: '$client.name' },
          projectCount: { $sum: 1 },
          totalSpent: { $sum: '$budget.depositPaid' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);
    
    // Client acquisition over time
    const clientAcquisition = await Quote.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          uniqueEmails: { $addToSet: '$email' }
        }
      },
      {
        $project: {
          _id: 1,
          newClients: { $size: '$uniqueEmails' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        topClients,
        clientAcquisition
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client insights',
      error: error.message
    });
  }
};

// @desc    Export analytics report
// @route   GET /api/analytics/export
// @access  Private
exports.exportAnalytics = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    // Get all analytics data
    const quotes = await Quote.find().lean();
    const projects = await Project.find().lean();
    const payments = await Payment.find().lean();
    const contacts = await Contact.find().lean();
    
    const data = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalQuotes: quotes.length,
        totalProjects: projects.length,
        totalPayments: payments.length,
        totalContacts: contacts.length
      },
      quotes,
      projects,
      payments,
      contacts
    };
    
    if (format === 'csv') {
      // Simple CSV export (would need proper CSV library for production)
      let csv = 'Type,ID,Name,Email,Status,Amount,Date\n';
      quotes.forEach(q => {
        csv += `Quote,${q._id},${q.name},${q.email},${q.status},${q.quoteAmount || 0},${q.createdAt}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting analytics',
      error: error.message
    });
  }
};
