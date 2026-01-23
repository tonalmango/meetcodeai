const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Set Mongoose default query timeout
mongoose.set('bufferTimeoutMS', 30000); // 30 seconds instead of 10
mongoose.set('maxTimeMS', 30000);
mongoose.set('bufferCommands', false); // Don't buffer commands if not connected

const quoteRoutes = require('./routes/quoteRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const logger = require('./config/logger');

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// General rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiter for auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true
});

app.use('/api', limiter);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'https://api.meetcodeai.site',
            'https://meetcodeai.site',
            'https://www.meetcodeai.site',
            'https://meetcodeai.onrender.com',
            process.env.CLIENT_URL,
            process.env.FRONTEND_URL
        ].filter(Boolean); // Remove undefined values
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Allow all origins for now (development mode)
            callback(null, true);
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Connect to MongoDB
console.log('Attempting MongoDB connection...');
console.log('MongoDB URI configured:', process.env.MONGODB_URI ? 'Yes' : 'No');
try {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meetcodeai', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4 // Use IPv4, skip trying IPv6
    })
    .then(() => {
        console.log('✓ MongoDB connected successfully');
        logger.info('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('✗ MongoDB connection error:', err.message);
        logger.error('MongoDB connection error: ' + err.message);
        logger.warn('Continuing without database - some features may be limited');
        // Don't exit - allow server to run even without MongoDB
    });
} catch (err) {
    console.error('MongoDB connection exception:', err.message);
    logger.error('MongoDB connection exception: ' + err.message);
}

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'MeetCodeAI API is running',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Test MongoDB connection
app.get('/api/test/mongodb', async (req, res) => {
    try {
        const mongooseState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        res.json({
            status: 'ok',
            mongooseState: states[mongooseState],
            mongooseReadyState: mongooseState,
            mongodbConnected: mongooseState === 1,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// View backup quotes (when MongoDB is unavailable)
app.get('/api/quotes/backup', (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const quotesFile = path.join(__dirname, 'quotes-backup.json');
        
        if (fs.existsSync(quotesFile)) {
            const data = fs.readFileSync(quotesFile, 'utf8');
            const quotes = JSON.parse(data);
            res.json({
                status: 'success',
                count: quotes.length,
                data: { quotes }
            });
        } else {
            res.json({
                status: 'success',
                count: 0,
                data: { quotes: [] },
                message: 'No backup quotes found yet'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Serve frontend files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'MeetCodeAI API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve index.html for all non-API routes (client-side routing)
app.get('*', (req, res) => {
    // Only serve index.html for GET requests that aren't API calls
    if (!req.originalUrl.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } else {
        res.status(404).json({
            status: 'error',
            message: `Cannot ${req.method} ${req.originalUrl}`
        });
    }
});

app.use(errorMiddleware);

// Catch all errors
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR - Uncaught Exception:', err);
    logger.error('Uncaught Exception: ' + err.message);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    const msg = `Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`;
    console.log(msg); // Also log to console
    logger.info(msg);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close();
        process.exit(0);
    });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection: ' + err.message);
    process.exit(1);
});