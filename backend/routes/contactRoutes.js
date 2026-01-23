const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

const contactValidationRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
        .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters')
];

router.post('/', contactValidationRules, contactController.submitContact);

router.use(authMiddleware.protect);
router.get('/', authMiddleware.restrictTo('admin'), contactController.getAllContacts);
router.get('/:id', authMiddleware.restrictTo('admin'), contactController.getContact);
router.patch('/:id', authMiddleware.restrictTo('admin'), contactController.updateContact);
router.delete('/:id', authMiddleware.restrictTo('admin'), contactController.deleteContact);

module.exports = router;
