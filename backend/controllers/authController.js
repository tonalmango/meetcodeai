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

        // Check if user already exists
        const existingUser = await User.findOne({ email });
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
            email,
            password,
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

        const user = await User.findOne({ email }).select('+password');

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

        const user = await User.findOne({ email });
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
