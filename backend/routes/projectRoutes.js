const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMilestone,
  updateMilestone,
  addNote,
  getProjectStats
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Stats route (must be before /:id route)
router.get('/stats', getProjectStats);

// Main CRUD routes
router.route('/')
  .get(getAllProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

// Milestone routes
router.post('/:id/milestones', addMilestone);
router.put('/:id/milestones/:milestoneId', updateMilestone);

// Notes route
router.post('/:id/notes', addNote);

module.exports = router;
