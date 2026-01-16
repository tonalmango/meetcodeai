const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const registerValidationRules = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required')
];

const loginValidationRules = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidationRules, authController.register);
router.post('/login', loginValidationRules, authController.login);
router.post('/logout', authMiddleware.protect, authController.logout);
router.get('/me', authMiddleware.protect, authController.getMe);
router.patch('/updatePassword', authMiddleware.protect, authController.updatePassword);
// One-time admin promotion (guarded by ADMIN_SETUP_TOKEN header)
router.post('/promote', authController.promoteToAdmin);

module.exports = router;
