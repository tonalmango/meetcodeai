# 🚀 MeetCodeAI - Where Code Meets Creativity

> **Gen Z-powered full-stack digital agency platform** combining custom development, AI integrations, and modern web solutions. Production-ready with JWT authentication, PayPal payments, 3-tier subscription system, real-time chat support, and a powerful admin dashboard.

**Status**: ✅ Production Ready | **Last Updated**: January 16, 2026

---

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-based authentication** with 7-day token expiration
- **Bcrypt password hashing** with salt rounds
- **Rate limiting**: 5 attempts/15min on auth, 100/15min general API
- **CORS protection**, Helmet security headers, input validation
- **Secure logout** with token blacklisting support

### 💳 Subscription & Payments
- **3-tier subscription system**: Starter ($150), Pro ($500), Enterprise ($1K/month)
- **PayPal integration** with Sandbox/Live mode support
- **Automatic quota enforcement** (quotes/projects/API calls per tier)
- **Monthly usage tracking** with auto-reset
- **Auto-renewal support** with expiration tracking

### 📊 Admin Dashboard (5 Tabs)
1. **Dashboard** - Real-time metrics, quotes, and stats
2. **Quotes** - Quote management (view, edit, delete, status tracking)
3. **Contacts** - Contact message inbox with read/unread status
4. **Projects** - Ongoing project tracking with milestones
5. **Analytics** - Advanced metrics, trends, and data export

### 💬 Customer Support
- **Real-time chat interface** for post-purchase support
- **Support team profiles** (Code Expert, Design Master, Strategy Ace)
- **Auto-response system** with typing indicators
- **Plan information display** in sidebar

### 📁 Project & File Management
- **Project lifecycle tracking** with milestones
- **File upload system** (max 10 files, 10MB each, images/PDFs/docs)
- **Asset organization** by project or quote
- **File download & management** capabilities

### 🎨 User Experience
- **Responsive design** across all devices (mobile-first)
- **Smooth animations** and glassmorphism UI
- **Gen Z-inspired branding** with vibrant colors
- **Custom SVG favicon** with MeetCodeAI branding
- **Real-time notifications** for user feedback

### 📈 Analytics & Reporting
- **Dashboard metrics** (total quotes, projects, revenue)
- **Performance KPIs** (conversion rates, avg project value)
- **Client insights** (lifetime value, retention)
- **Data export** (JSON/CSV formats)

### 🔄 User Flow
```
Pricing Section
    ↓ Select Plan → Opens Login/Register
Login/Register 
    ↓ Authenticate → Redirected to Checkout
Checkout
    ↓ Enter Details → PayPal Integration
Payment Success
    ↓ Subscription Active → Chat with Team
Chat Support
    ↓ Discuss Requirements → Support Team Response
```

---

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js v20+
- **Framework**: Express.js 4.18+
- **Database**: MongoDB 8.2+ with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken 9.0+)
- **Password Security**: bcryptjs 2.4+
- **Payment**: PayPal REST API (axios integration)
- **File Upload**: Multer 1.4+
- **Logging**: Winston 3.10+
- **Security**: Helmet 7.0+, express-rate-limit 6.10+
- **Validation**: express-validator 7.0+

### Frontend
- **Markup**: HTML5
- **Styling**: CSS3 with responsive design
- **Logic**: Vanilla JavaScript (no frameworks)
- **UI Components**: Font Awesome icons, Google Fonts
- **Real-time**: Chat interface with auto-responses
- **API Client**: Fetch API with runtime detection

### Infrastructure
- **Deployment**: Render.com (backend), CDN-ready (frontend)
- **Database Hosting**: MongoDB Atlas
- **Email**: SMTP (Gmail/custom)
- **Payments**: PayPal (Sandbox for testing, Live for production)

---

## 🛠️ Quick Start

### Prerequisites
```
✓ Node.js v20 or higher
✓ MongoDB v8.2 or higher (local or MongoDB Atlas)
✓ PayPal Business Account (for payment features)
✓ Email service (Gmail/Mailgun/SendGrid)
```

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/meetcodeai.git
cd meetcodeai

# 2. Install backend dependencies
cd backend
npm install

# 3. Create environment file
cp .env.example .env

# 4. Configure environment variables (see section below)

# 5. Start development server
npm run dev
```

**Backend runs on**: http://localhost:5000  
**Frontend**: Open `frontend/index.html` in browser or use Live Server

### First Admin Setup

The first registered user automatically becomes admin:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@meetcodeai.com",
    "password": "SecurePassword123!",
    "name": "Admin User"
  }'
```

---

## 🔐 Environment Variables

**Create `.env` file in `/backend` directory:**

```env
# Core Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meetcodeai?retryWrites=true&w=majority

# JWT
JWT_SECRET=generate-with-openssl-rand-base64-32-chars-minimum

# Frontend
FRONTEND_URL=https://meetcodeai.onrender.com

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@meetcodeai.com

# PayPal Integration ✨
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # Change to 'live' for production

# Optional
API_RATE_LIMIT=100
LOG_LEVEL=info
```

### Generate Secure JWT Secret

```bash
# Windows PowerShell
$random = [System.Guid]::NewGuid().ToString().Replace("-", "") + [System.Guid]::NewGuid().ToString().Replace("-", "")
Write-Host $random

# Linux/Mac
openssl rand -base64 32
```

### Get PayPal Credentials

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Create/login to business account
3. Create app in Developer Dashboard
4. Copy Client ID and Secret
5. Use Sandbox mode for testing, Live for production

---

## 📁 Project Structure

```
meetcodeai/
├── backend/
│   ├── config/
│   │   ├── database.js           # MongoDB connection
│   │   └── logger.js             # Winston logging
│   ├── controllers/
│   │   ├── authController.js     # Registration, login, JWT
│   │   ├── quoteController.js    # Quote CRUD
│   │   ├── contactController.js  # Contact management
│   │   ├── subscriptionController.js  # Subscription logic
│   │   ├── paymentController.js  # PayPal payments
│   │   ├── projectController.js  # Project tracking
│   │   ├── uploadController.js   # File uploads
│   │   └── analyticsController.js # Analytics data
│   ├── models/
│   │   ├── User.js               # User schema with subscriptionId
│   │   ├── Quote.js              # Quote schema
│   │   ├── Contact.js            # Contact schema
│   │   ├── Subscription.js       # Subscription with tiers
│   │   ├── Payment.js            # Payment records
│   │   ├── Project.js            # Project tracking
│   │   └── Upload.js             # File tracking
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── quoteRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── subscriptionRoutes.js ✨
│   │   ├── paymentRoutes.js      ✨
│   │   ├── projectRoutes.js      ✨
│   │   ├── uploadRoutes.js       ✨
│   │   └── analyticsRoutes.js    ✨
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── errorMiddleware.js    # Global error handler
│   ├── logs/                     # Auto-generated logs
│   ├── server.js                 # Express app entry
│   ├── package.json
│   └── .env                      # Configuration
│
├── frontend/
│   ├── index.html                # Landing page with pricing
│   ├── checkout.html             # Checkout form ✨
│   ├── payment-success.html      # Payment confirmation ✨
│   ├── chat.html                 # Support chat ✨
│   ├── admin.html                # Admin dashboard
│   ├── script.js                 # Frontend logic
│   ├── styles.css                # Responsive styling
│   ├── favicon.svg               # Custom icon
│   └── admin.js                  # Dashboard API
│
├── README.md                     # This file
└── .gitignore
```

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| POST | `/register` | Public | Create new account (first = admin) |
| POST | `/login` | Public | Login, get JWT token |
| GET | `/me` | Protected | Get current user info |
| PATCH | `/updatePassword` | Protected | Change password |

### Subscriptions (`/api/subscriptions`) ✨
| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| POST | `/create-or-upgrade` | Protected | Create/upgrade subscription |
| GET | `/user` | Protected | Get user subscription |
| GET | `/plans` | Public | List available plans |
| GET | `/check-feature/:feature` | Protected | Check feature access |
| POST | `/check-quota/:feature` | Protected | Verify and use quota |

### Payments (`/api/payments`) ✨
| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| POST | `/checkout/create-order` | Public | Create PayPal order |
| POST | `/checkout/capture` | Public | Capture payment & create subscription |
| GET | `/` | Protected | List all payments |

### Quotes (`/api/quotes`)
| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| POST | `/` | Public | Submit quote request |
| GET | `/` | Protected | List all quotes |
| GET | `/:id` | Protected | Get quote details |
| PATCH | `/:id` | Protected | Update quote |
| DELETE | `/:id` | Protected | Delete quote |

### Contacts (`/api/contacts`)
| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| POST | `/` | Public | Submit contact form |
| GET | `/` | Protected | List all contacts |
| GET | `/:id` | Protected | Get contact details |
| PATCH | `/:id` | Protected | Mark as read |
| DELETE | `/:id` | Protected | Delete contact |

### Projects (`/api/projects`) ✨
| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| GET | `/` | Protected | List projects |
| POST | `/` | Protected | Create project |
| GET | `/:id` | Protected | Get project details |
| PUT | `/:id` | Protected | Update project |
| DELETE | `/:id` | Protected | Delete project |
| POST | `/:id/milestones` | Protected | Add milestone |

### File Uploads (`/api/upload`) ✨
| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| POST | `/project/:id` | Protected | Upload to project |
| GET | `/file/:filename` | Protected | Download file |
| DELETE | `/:id` | Protected | Delete file |

### Analytics (`/api/analytics`) ✨
| Method | Endpoint | Protection | Description |
|--------|----------|-----------|-------------|
| GET | `/dashboard` | Protected | Dashboard metrics |
| GET | `/performance` | Protected | Performance KPIs |
| GET | `/export?format=csv` | Protected | Export data |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API status & uptime |

---

## 💳 Subscription Tiers

| Feature | Starter | Pro | Enterprise |
|---------|---------|-----|-----------|
| **Price** | $150/mo | $500/mo | $1,000/mo |
| Quotes/Month | 20 | 100 | Unlimited |
| Projects | 5 | 20 | Unlimited |
| API Calls/Month | 5,000 | 50,000 | Unlimited |
| Storage | 10 GB | 100 GB | Unlimited |
| Team Members | 1 | 5 | Unlimited |
| Custom Branding | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| Analytics | Basic | Advanced | Custom |
| Monthly Reset | Yes | Yes | Yes |

---

## 🚀 Production Deployment

### Step 1: Set Up MongoDB Atlas

```bash
# 1. Create account at mongodb.com/cloud
# 2. Create cluster (free tier available)
# 3. Create database user
# 4. Whitelist IP (or 0.0.0.0/0 for any IP)
# 5. Get connection string and add to .env
```

### Step 2: Deploy Backend on Render

```
1. Push code to GitHub repository
2. Create new Web Service on Render.com
3. Connect GitHub repo
4. Build command: cd backend && npm install
5. Start command: node server.js
6. Add environment variables from Render dashboard
7. Deploy (Render auto-deploys on git push)
```

**Environment variables for Render:**
```
NODE_ENV=production
MONGODB_URI=your-atlas-uri
JWT_SECRET=your-generated-secret
FRONTEND_URL=your-frontend-url
PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
PAYPAL_MODE=sandbox (for testing) or live
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD
```

### Step 3: Deploy Frontend

**Option 1: Cloudflare Pages (Recommended)**
```
1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Build command: (leave empty)
4. Publish directory: frontend/
5. Add environment variable: API_BASE_URL=https://your-api-url.onrender.com/api
```

**Option 2: Netlify**
```
1. Connect GitHub repo
2. Build settings:
   - Base directory: frontend
   - Publish directory: frontend
3. Environment variables:
   - API_BASE_URL=https://your-api-url
4. Deploy
```

**Option 3: Vercel**
```
1. Connect GitHub repo
2. Framework: None
3. Root directory: frontend
4. Deploy
```

### Step 4: Configure Custom Domain (Optional)

```bash
# Add DNS records to your domain registrar:
# CNAME record for API: api.yourdomain.com → your-render-url.onrender.com
# CNAME record for Frontend: www.yourdomain.com → your-frontend-url
```

### Step 5: Enable HTTPS

Most platforms (Render, Vercel, Netlify) automatically provision SSL certificates. Ensure:
- All traffic redirects to HTTPS
- Update API URLs in frontend to use HTTPS
- Set `FRONTEND_URL` to HTTPS in backend

---

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` to strong 32+ character random string
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Use strong MongoDB Atlas password (20+ chars)
- [ ] Configure MongoDB IP whitelist (not 0.0.0.0/0)
- [ ] Enable HTTPS everywhere (no HTTP)
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use environment-specific secrets (never commit .env)
- [ ] Set up automated MongoDB backups
- [ ] Configure PayPal to Live mode (not Sandbox)
- [ ] Monitor logs for suspicious activity
- [ ] Update dependencies regularly: `npm audit`
- [ ] Use strong admin passwords
- [ ] Enable rate limiting in production

---

## 🧪 Testing

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Use token (replace with actual token)
curl -X GET http://localhost:5000/api/quotes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test PayPal Integration

```bash
# Create checkout order
curl -X POST http://localhost:5000/api/payments/checkout/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"pro"}'

# Capture payment (after PayPal approval)
curl -X POST http://localhost:5000/api/payments/checkout/capture \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"PAYPAL_ORDER_ID"}'
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# Development
npm run dev    # Logs in console

# Production (with PM2)
pm2 logs meetcodeai
pm2 monit

# View log files
tail -f backend/logs/error.log
tail -f backend/logs/combined.log
```

### Key Metrics
- Request duration (ms)
- HTTP status codes
- MongoDB connection events
- Authentication attempts
- Payment transactions
- API quota usage

---

## 🔧 Common Commands

```bash
# Development
cd backend && npm run dev

# Production
cd backend && npm start

# Check API health
curl http://localhost:5000/api/health

# View Node processes
Get-Process -Name node        # Windows
ps aux | grep node            # Linux/Mac

# Stop all Node
Stop-Process -Name node       # Windows
killall node                  # Linux/Mac

# Install new dependency
npm install package-name

# Update dependencies
npm update

# Check for vulnerabilities
npm audit
npm audit fix
```

---

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
# Windows
netstat -ano | findstr :5000
Stop-Process -Id <PID> -Force

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### MongoDB connection error
- Verify `MONGODB_URI` in `.env` is correct
- Check MongoDB Atlas IP whitelist
- Ensure database user credentials are correct
- Check firewall allows MongoDB port

### JWT token invalid
- Verify `JWT_SECRET` matches between restarts
- Check token hasn't expired (7 days)
- Try logging in again to get fresh token

### CORS errors
- Verify `FRONTEND_URL` in `.env` matches frontend domain
- Check frontend sends requests to correct API URL
- Verify CORS origins in `server.js`

### PayPal errors
- Check PayPal credentials are correct
- Verify `PAYPAL_MODE` is set to 'sandbox' for testing
- Check PayPal API is accessible from server
- Review PayPal logs in Developer Dashboard

---

## 📝 File Structure Reference

**Important files to customize:**
- `frontend/styles.css` - Brand colors and styling
- `frontend/index.html` - Landing page content
- `backend/config/database.js` - MongoDB setup
- `backend/config/logger.js` - Logging configuration
- `.env` - All sensitive configuration

**Generated folders (auto-created):**
- `backend/logs/` - Application logs
- `backend/uploads/` - User-uploaded files
- `node_modules/` - Dependencies

---

## 🚢 CI/CD Pipeline (Optional)

Create `.github/workflows/deploy.yml` for auto-deployment:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger Render deploy
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## 📞 Support & Community

- **Documentation**: This README
- **Issues**: GitHub Issues
- **Email**: support@meetcodeai.com
- **Chat**: In-app support chat (after payment)

---

## 📜 License

MIT License - Feel free to use for commercial projects. See LICENSE file for details.

---

## 🙏 Contributors

- **Lead Developer**: MeetCodeAI Team
- **PayPal Integration**: January 2026
- **Chat Feature**: January 2026
- **Subscription System**: January 2026

---

**🚀 Ready to launch?** Push your code and deploy today!

**Questions?** Check the troubleshooting section or create a GitHub issue.

**Last Updated**: January 16, 2026 | **Version**: 2.0.0-prod

## �🚀 Features

### Core Features
- **JWT Authentication** - Secure user authentication with bcrypt password hashing
- **Admin Dashboard** - Real-time quote and contact management interface
- **Rate Limiting** - 5 attempts/15min on auth, 100/15min on general API
- **Security Hardening** - Helmet CSP headers, CORS restrictions, input validation
- **Logging & Monitoring** - Winston logger with file rotation and request tracking
- **Graceful Shutdown** - Proper SIGTERM/SIGINT handlers for zero-downtime deployments

### ✨ New Features (v2.0)
- **📊 Project Management** - Track ongoing projects with milestones, progress, and status updates
- **📁 File Upload System** - Client file uploads for design assets (images, PDFs, docs, archives)
- **💳 Payment Integration** - PayPal payment processing with automatic budget tracking
- **📈 Advanced Analytics** - Comprehensive dashboard with metrics, trends, and data export
- **🎨 Custom Favicon** - Professional browser tab icon

## 📋 Tech Stack

**Backend:**
- Node.js v20+ / Express.js
- MongoDB with Mongoose ODM
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing
- **@paypal/checkout-server-sdk** for payment processing ✨ NEW
- **Multer** for file uploads ✨ NEW
- Winston v3.10.0 for logging
- Helmet, express-rate-limit, CORS for security

**Frontend:**
- Vanilla JavaScript with runtime API detection
- Responsive admin dashboard
- Auto-refresh data tables
- **Custom SVG favicon** ✨ NEW

## 🛠️ Quick Start (Development)

### Prerequisites
- Node.js v20+ installed
- MongoDB v8.2+ running (localhost:27017 or Atlas)
- **PayPal account** (for payment features) ✨ NEW

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Agency

# Install backend dependencies
cd backend
npm install

# Create environment file
cp .env.example .env

# Update .env with your values (see Environment Variables section)
```
# At minimum, set JWT_SECRET and MONGODB_URI

# Start the development server
npm run dev
```

The backend API will run on `http://localhost:5000`  
Frontend is at `http://localhost:5500` (using Live Server)

### Create First Admin User

```bash
# Register a new admin user (works for first user or subsequent users)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@meetcodeai.com",
    "password": "AdminPassword123!",
    "name": "Admin User"
  }'
```

**Default Credentials (for local development):**
- Email: `admin@meetcodeai.com`
- Password: `AdminPassword123!`

**Note:** For production (meetcodeai.onrender.com), you'll need to register a user via the frontend or create one directly in your MongoDB database.

## 🔐 Environment Variables

Create a `.env` file in the `/backend` directory:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment mode (`development` or `production`) |
| `PORT` | No | `5000` | Server port |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | JWT signing secret (min 32 chars, random string) |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | Frontend domain for CORS |
| `EMAIL_HOST` | Yes | `smtp.gmail.com` | SMTP server hostname |
| `EMAIL_PORT` | Yes | `587` | SMTP port |
| `EMAIL_USER` | Yes | - | Email account username |
| `EMAIL_PASSWORD` | Yes | - | Email account password or app password |
| `EMAIL_FROM` | No | `noreply@corelogiclabs.com` | Sender email address |
| `API_RATE_LIMIT` | No | `100` | General API rate limit (requests per 15min) |
| `LOG_LEVEL` | No | `info` | Logging level (`error`, `warn`, `info`, `debug`) |
| ✨ `PAYPAL_CLIENT_ID` | Yes* | - | PayPal client ID (for payments) |
| ✨ `PAYPAL_CLIENT_SECRET` | Yes* | - | PayPal client secret |
| ✨ `PAYPAL_MODE` | No | `sandbox` | PayPal mode (sandbox or live) |

*Required only if using payment features

### Example .env File

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://corelogic-labs.onrender.com

# MongoDB - Production: MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/corelogiclabs?retryWrites=true&w=majority

# Email Service (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@corelogiclabs.com

# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-random-string

# ✨ NEW: PayPal Payment Integration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

API_RATE_LIMIT=100
LOG_LEVEL=info
```

### Generate Secure JWT Secret

```bash
# Windows PowerShell
$random = [System.Guid]::NewGuid().ToString().Replace("-", "") + [System.Guid]::NewGuid().ToString().Replace("-", "")
Write-Host $random

# Linux/Mac
openssl rand -base64 32
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── logger.js            # Winston logging configuration
├── controllers/
│   ├── authController.js    # Authentication logic (register, login, JWT)
│   ├── quoteController.js   # Quote CRUD operations
│   └── contactController.js # Contact CRUD operations
├── routes/
│   ├── authRoutes.js        # Auth endpoints (/api/auth/*)
│   ├── quoteRoutes.js       # Quote endpoints (/api/quotes/*)
│   └── contactRoutes.js     # Contact endpoints (/api/contacts/*)
├── models/
│   ├── User.js              # User schema with bcrypt
│   ├── Quote.js             # Quote schema
│   └── Contact.js           # Contact schema
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   └── errorMiddleware.js   # Global error handler
├── logs/                    # Winston log files (auto-created)
├── server.js                # Express app entry point
├── package.json
└── .env                     # Environment configuration

frontend/
├── login.html               # Admin login page
├── admin.html               # Admin dashboard
├── admin.js                 # Dashboard API integration
├── index.html               # Public landing page
├── script.js                # Quote form logic
└── styles.css               # Styling
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and receive JWT token
- `POST /logout` - Logout
- `GET /me` - Get current user (protected)
- `PATCH /updatePassword` - Change password (protected)

### Quotes (`/api/quotes`) - All protected except POST
- `POST /` - Submit quote request (public)
- `GET /` - List all quotes (admin only)
- `GET /stats` - Get quote statistics (admin)
- `GET /:id` - Get quote details (admin)
- `PATCH /:id` - Update quote (admin)
- `DELETE /:id` - Delete quote (admin)

### Contacts (`/api/contacts`) - All protected except POST
- `POST /` - Submit contact message (public)
- `GET /` - List all contacts (admin)
- `GET /:id` - Get contact details (admin)
- `PATCH /:id` - Mark contact as read (admin)
- `DELETE /:id` - Delete contact (admin)

### ✨ Projects (`/api/projects`) - NEW - All protected
- `GET /` - List all projects
- `POST /` - Create new project
- `GET /stats` - Get project statistics
- `GET /:id` - Get project details
- `PUT /:id` - Update project
- `DELETE /:id` - Delete project
- `POST /:id/milestones` - Add milestone
- `PUT /:id/milestones/:milestoneId` - Update milestone
- `POST /:id/notes` - Add project note

### ✨ File Uploads (`/api/upload`) - NEW - All protected
- `POST /project/:projectId` - Upload files to project (max 10 files, 10MB each)
- `POST /quote/:quoteId` - Upload files to quote
- `GET /file/:filename` - Download file
- `DELETE /project/:projectId/file/:fileId` - Delete file

### ✨ Payments (`/api/payments`) - NEW
- `POST /create-order` - Create PayPal order (protected)
- `POST /capture` - Capture PayPal payment (protected)
- `GET /` - List all payments (protected)
- `GET /project/:projectId` - Get payments by project (protected)
- `POST /manual` - Record manual payment (protected)
- `GET /stats` - Payment statistics (protected)

### ✨ Analytics (`/api/analytics`) - NEW - All protected
- `GET /dashboard?startDate=&endDate=` - Complete dashboard metrics
- `GET /performance` - Performance KPIs
- `GET /clients` - Client insights
- `GET /export?format=json|csv` - Export analytics data

### Health Check
- `GET /api/health` - API health status

**📖 Full API documentation:** See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🔒 Security Features

- **JWT Authentication** - 7-day token expiration with Bearer token format
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - 5 attempts/15min on auth endpoints, 100/15min general
- **CORS** - Restricted to frontend domain only
- **Helmet** - Security headers (CSP, XSS protection, no unsafe-inline)
- **Body Size Limit** - 10MB maximum request size
- **Input Validation** - Express-validator on all endpoints
- **Error Sanitization** - No stack traces or sensitive info in production
- **Graceful Shutdown** - SIGTERM/SIGINT handlers for cleanup

## 🚀 Production Deployment

### Recommended Platforms

**API Backend:**
- **Render** - Easy Node.js deployment with free tier
- **Railway** - Simple deployment with auto-scaling
- **Fly.io** - Global edge deployment

**Database:**
- **MongoDB Atlas** - Free tier available, auto-backups

**Static Frontend:**
- **Cloudflare Pages** - Fast CDN, free tier
- **Netlify** - Auto-deploy from git
- **Vercel** - Optimized for frontend

### Deployment Steps

#### 1. Set Up MongoDB Atlas

```bash
# 1. Create cluster at mongodb.com/cloud
# 2. Create database user
# 3. Whitelist IP addresses (or 0.0.0.0/0 for all)
# 4. Get connection string:
mongodb+srv://username:password@cluster.mongodb.net/whiteLabelAgency?retryWrites=true&w=majority
```

#### 2. Configure Production Environment

Update your platform's environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/whiteLabelAgency
JWT_SECRET=<your-generated-32-char-random-string>
FRONTEND_URL=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

#### 3. Deploy Backend

**Using Render:**
```bash
# 1. Connect GitHub repo to Render
# 2. Set Build Command: cd backend && npm install
# 3. Set Start Command: node server.js
# 4. Add environment variables from dashboard
# 5. Deploy
```

**Using Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
EXPOSE 5000
CMD ["node", "server.js"]
```

```bash
docker build -t white-label-api .
docker run -e NODE_ENV=production -p 5000:5000 white-label-api
```

**Using PM2 (Linux Server):**
```bash
# Install PM2
npm install -g pm2

# Start application
cd backend
pm2 start server.js --name "white-label-api"

# Save PM2 config for auto-restart
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs white-label-api
```

#### 4. Configure Nginx Reverse Proxy (Optional)

```nginx
upstream api {
    server localhost:5000;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.crt;
    ssl_certificate_key /path/to/ssl/key.key;

    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 5. Deploy Frontend

Upload the `frontend/` folder to your hosting platform. Update the API base URL in [index.html](frontend/index.html):

```html
<script>
  if (window.location.hostname === 'localhost') {
    window.API_BASE_URL = 'http://localhost:5000/api';
  } else {
    window.API_BASE_URL = 'https://api.yourdomain.com/api';
  }
</script>
```

### SSL/TLS Certificates

```bash
# Using Let's Encrypt (free)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

## 📊 Admin Dashboard

Access the admin panel at `/login.html` or `/admin.html`

**Features:**
- Real-time quote statistics
- Quote management (view, edit, delete, update status)
- Contact message management
- Auto-refresh every 30 seconds
- Responsive tables with action buttons

**Admin Credentials:**
- Email: `admin@whiteLabelAgency.com`
- Password: `AdminPassword123!`

⚠️ **Change default credentials immediately in production!**

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "success",
  "message": "White-Label Agency API is running",
  "timestamp": "2026-01-04T...",
  "uptime": 1234.56
}
```

### Test Authentication Flow
```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# 2. Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. Access protected route with token
curl -X GET http://localhost:5000/api/quotes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Quote Submission
```bash
curl -X POST http://localhost:5000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "email": "test@company.com",
    "phone": "555-1234",
    "message": "Need website redesign"
  }'
```

## 📈 Monitoring & Logging

### View Logs

```bash
# Error logs only
tail -f backend/logs/error.log

# All logs
tail -f backend/logs/combined.log

# With PM2
pm2 logs white-label-api
pm2 monit
```

### Log Files
- `logs/error.log` - Error-level logs only
- `logs/combined.log` - All log levels (info, warn, error)

### Metrics Tracked
- Request duration (ms)
- HTTP method and path
- Status codes
- MongoDB connection events
- Unhandled promise rejections

## 🔧 Operations

### Useful Commands

```bash
# Development mode
npm run dev

# Production mode
npm run prod

# Check server status
curl http://localhost:5000/api/health

# View active Node processes
Get-Process -Name node          # Windows
ps aux | grep node              # Linux/Mac

# Stop all Node processes
Stop-Process -Name node -Force  # Windows
killall node                     # Linux/Mac

# PM2 operations
pm2 status
pm2 restart white-label-api
pm2 stop white-label-api
pm2 delete white-label-api
```

### Database Backups

```bash
# MongoDB Atlas - Enable automatic backups in dashboard
# Local MongoDB - Use mongodump
mongodump --uri="mongodb://localhost:27017/whiteLabelAgency" --out=/backup/$(date +%Y%m%d)
```

## ⚠️ Security Checklist (Production)

- [ ] Change `JWT_SECRET` to strong random string (32+ chars)
- [ ] Update `FRONTEND_URL` to actual production domain
- [ ] Use MongoDB Atlas with strong password
- [ ] Configure email service with real credentials
- [ ] Enable HTTPS only (no HTTP)
- [ ] Set `NODE_ENV=production` in environment
- [ ] Configure IP whitelist in MongoDB Atlas
- [ ] Never commit `.env` files to git (use `.gitignore`)
- [ ] Set up automated database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Use strong admin passwords
- [ ] Implement backup strategy for logs

### .gitignore (Required)
```
.env
.env.local
.env.*.local
logs/
node_modules/
*.log
```

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Linux/Mac

# Kill process on port 5000
Stop-Process -Id <PID> -Force  # Windows
kill -9 <PID>                  # Linux/Mac
```

### MongoDB connection failed
```bash
# Check if MongoDB is running
Get-Service MongoDB            # Windows
sudo systemctl status mongod   # Linux

# Start MongoDB
Start-Service MongoDB          # Windows
sudo systemctl start mongod    # Linux
```

### JWT token expired
- Tokens expire after 7 days
- User must log in again to get new token
- Check `JWT_SECRET` matches across restarts

### CORS errors
- Verify `FRONTEND_URL` in `.env` matches frontend domain
- Check browser console for specific CORS error
- Ensure frontend sends requests to correct API URL

## 📝 License

MIT License - feel free to use for commercial projects

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

**Status**: ✅ Production Ready  
**Last Updated**: January 4, 2026  
**Admin Login**: http://localhost:3000/login.html  
**API Health**: http://localhost:5000/api/health
