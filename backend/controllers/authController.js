const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { email, password, name } = req.body;
        const normalizedEmail = String(email || '')
            .normalize('NFKC')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/\s+/g, '')
            .toLowerCase()
            .trim();
        const normalizedPassword = String(password || '')
            .normalize('NFKC')
            .trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        // If no admin exists yet, auto-promote this registered user to admin
        const adminCount = await User.countDocuments({ role: 'admin' });
        const role = adminCount === 0 ? 'admin' : 'user';

        const user = await User.create({
            email: normalizedEmail,
            password: normalizedPassword,
            name,
            role
        });

        const token = generateToken(user._id);

        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        const normalizedEmail = String(email || '')
            .normalize('NFKC')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/\s+/g, '')
            .toLowerCase()
            .trim();

        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                status: 'error',
                message: 'Your account has been deactivated'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide current and new password'
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully',
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        console.log('=== UPDATE PROFILE CALLED ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.user?.id);
        
        const { email, name, password } = req.body;
        
        if (!email && !name && !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide at least one field to update'
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Update email - just accept it as is
        if (email) {
            user.email = String(email).toLowerCase().trim();
            console.log('Email updated to:', user.email);
        }

        // Update name
        if (name) {
            user.name = String(name).trim();
            console.log('Name updated to:', user.name);
        }

        // Update password
        if (password) {
            user.password = String(password);
            console.log('Password updated');
        }

        await user.save();
        const token = generateToken(user._id);

        console.log('Profile saved successfully');

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: { 
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('ERROR in updateProfile:', error);
        next(error);
    }
};

// Diagnostic endpoint - check if user exists and test email normalization
exports.debugLogin = async (req, res, next) => {
    try {
        // Support both GET query params and POST body
        const { email, password } = req.method === 'GET' ? req.query : req.body;
        
        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is required'
            });
        }

        // Normalize email same way as login
        const normalizedEmail = String(email)
            .normalize('NFKC')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/\s+/g, '')
            .toLowerCase()
            .trim();

        // Find user
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user) {
            return res.status(200).json({
                status: 'debug',
                message: 'User not found',
                normalized_email: normalizedEmail,
                raw_email: email,
                user_exists: false
            });
        }

        // If password provided, test it
        let passwordMatch = false;
        if (password) {
            const rawPassword = String(password).normalize('NFKC');
            const trimmedPassword = rawPassword.trim();
            passwordMatch = await user.comparePassword(rawPassword) || await user.comparePassword(trimmedPassword);
        }

        res.status(200).json({
            status: 'debug',
            normalized_email: normalizedEmail,
            raw_email: email,
            user_exists: true,
            user_id: user._id,
            user_name: user.name,
            password_match: passwordMatch,
            password_provided: !!password
        });
    } catch (error) {
        next(error);
    }
};

// One-time admin promotion endpoint guarded by setup token
exports.promoteToAdmin = async (req, res, next) => {
    try {
        const setupToken = req.headers['x-setup-token'];
        if (!process.env.ADMIN_SETUP_TOKEN) {
            return res.status(403).json({
                status: 'error',
                message: 'ADMIN_SETUP_TOKEN is not configured on the server'
            });
        }
        if (!setupToken || setupToken !== process.env.ADMIN_SETUP_TOKEN) {
            return res.status(403).json({
                status: 'error',
                message: 'Invalid setup token'
            });
        }

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: 'error', message: 'Email is required' });
        }

        const normalizedEmail = String(email || '')
            .normalize('NFKC')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/\s+/g, '')
            .toLowerCase()
            .trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        user.role = 'admin';
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: 'success',
            message: `User ${email} promoted to admin`,
            data: { user: { id: user._id, email: user.email, name: user.name, role: user.role } }
        });
    } catch (error) {
        next(error);
    }
};
