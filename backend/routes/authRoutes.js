const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const sanitizeEmail = body('email')
    .trim()
    .customSanitizer(v => (v || '').replace(/\s+/g, ''))
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false })
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email');

const sanitizePassword = body('password').trim();

const registerValidationRules = [
    sanitizeEmail,
    sanitizePassword.isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required')
];

const loginValidationRules = [
    sanitizeEmail,
    sanitizePassword.notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidationRules, authController.register);
router.post('/login', loginValidationRules, authController.login);
router.post('/logout', authMiddleware.protect, authController.logout);
router.get('/me', authMiddleware.protect, authController.getMe);
router.patch('/updatePassword', authMiddleware.protect, authController.updatePassword);
router.post('/update-profile', authMiddleware.protect, authController.updateProfile);
// One-time admin promotion (guarded by ADMIN_SETUP_TOKEN header)
router.post('/promote', authController.promoteToAdmin);

module.exports = router;
