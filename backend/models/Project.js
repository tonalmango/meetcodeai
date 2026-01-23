const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  client: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    agencyName: String
  },
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  },
  services: [{
    type: String,
    enum: [
      'Custom Website Design',
      'E-commerce Development',
      'SEO Services',
      'Social Media Management',
      'Content Marketing',
      'Branding & Identity',
      'Mobile App Development',
      'Other'
    ]
  }],
  budget: {
    total: Number,
    depositPaid: { type: Number, default: 0 },
    balanceDue: Number
  },
  timeline: {
    startDate: Date,
    estimatedCompletion: Date,
    actualCompletion: Date
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'review', 'revisions', 'completed', 'on-hold'],
    default: 'planning'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    name: String,
    description: String,
    dueDate: Date,
    completedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    }
  }],
  files: [{
    filename: String,
    originalName: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: String,
    uploadedAt: { type: Date, default: Date.now },
    url: String
  }],
  notes: [{
    author: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate balance due before saving
projectSchema.pre('save', function(next) {
  if (this.budget && this.budget.total && this.budget.depositPaid !== undefined) {
    this.budget.balanceDue = this.budget.total - this.budget.depositPaid;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
