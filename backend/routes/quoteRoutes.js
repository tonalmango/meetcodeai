const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const quoteController = require('../controllers/quoteController');
const authMiddleware = require('../middleware/authMiddleware');

const quoteValidationRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('agencyName').trim().notEmpty().withMessage('Agency name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('services').optional().isArray().withMessage('Services must be an array'),
    body('budget').isIn(['1-2k', '2-5k', '5-10k', '10k+', 'not-sure']).withMessage('Please select a valid budget range'),
    body('details').optional().trim().isLength({ max: 2000 }).withMessage('Details cannot exceed 2000 characters')
];

router.post('/', authMiddleware.protect, quoteValidationRules, quoteController.submitQuote);

router.use(authMiddleware.protect);
router.get('/', authMiddleware.restrictTo('admin'), quoteController.getAllQuotes);
router.get('/stats', authMiddleware.restrictTo('admin'), quoteController.getQuoteStats);
router.get('/:id', authMiddleware.restrictTo('admin'), quoteController.getQuote);
router.patch('/:id', authMiddleware.restrictTo('admin'), quoteController.updateQuote);
router.delete('/:id', authMiddleware.restrictTo('admin'), quoteController.deleteQuote);

module.exports = router;