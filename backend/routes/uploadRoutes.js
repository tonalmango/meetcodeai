const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const Project = require('../models/Project');
const Quote = require('../models/Quote');
const { protect } = require('../middleware/authMiddleware');
const path = require('path');
const fs = require('fs');

// All routes require authentication
router.use(protect);

// @desc    Upload files to a project
// @route   POST /api/upload/project/:projectId
// @access  Private
router.post('/project/:projectId', upload.array('files', 10), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      // Delete uploaded files if project not found
      req.files?.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Add file info to project
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.user?.name || 'Client',
      url: `/uploads/${file.filename}`
    }));
    
    project.files.push(...uploadedFiles);
    await project.save();
    
    res.json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    // Clean up uploaded files on error
    req.files?.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    });
    
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// @desc    Upload files to a quote
// @route   POST /api/upload/quote/:quoteId
// @access  Private
router.post('/quote/:quoteId', upload.array('files', 10), async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.quoteId);
    
    if (!quote) {
      // Delete uploaded files if quote not found
      req.files?.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }
    
    // Add file info to quote notes
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.user?.name || 'Client',
      uploadedAt: new Date()
    }));
    
    // Add note about uploaded files
    if (!quote.notes) quote.notes = '';
    const fileList = uploadedFiles.map(f => f.originalName).join(', ');
    quote.notes += `\n\n[Files uploaded: ${fileList}]`;
    await quote.save();
    
    res.json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    // Clean up uploaded files on error
    req.files?.forEach(file => {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    });
    
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// @desc    Delete file from project
// @route   DELETE /api/upload/project/:projectId/file/:fileId
// @access  Private
router.delete('/project/:projectId/file/:fileId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const file = project.files.id(req.params.fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Delete physical file
    const filePath = path.join(__dirname, '../uploads', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from project
    file.remove();
    await project.save();
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

// @desc    Get file (download)
// @route   GET /api/upload/file/:filename
// @access  Private
router.get('/file/:filename', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading file',
      error: error.message
    });
  }
});

module.exports = router;
