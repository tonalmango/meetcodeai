const ChatMessage = require('../models/ChatMessage');

// AI training responses based on message content
const getAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Categorize the message
    let responses = [];
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget') || lowerMessage.includes('pricing')) {
        responses = [
            'We have 3 packages: **Starter** ($149) for landing pages/portfolios, **Pro** ($499 - most popular!) with AI chatbot & custom animations, and **Enterprise** ($999+) with e-commerce & unlimited revisions. Which interests you?',
            'Our pricing is super transparent! Starter at $149, Pro at $499 (includes AI chatbot!), and Enterprise at $999+. We also offer AI Chatbots ($49/mo) and Email Automation ($49/mo). What type of project are you planning?',
            'For white-label websites: Starter ($149, 1-week delivery), Pro ($499, includes CMS & chatbot), Enterprise ($999+, e-commerce ready). All prices are one-time for the build. Which fits your client\'s needs?'
        ];
    } else if (lowerMessage.includes('starter') || lowerMessage.includes('basic package')) {
        responses = [
            'The Starter Pack ($149) is perfect for landing pages and portfolios! Includes: lightning-fast websites, mobile-first design, SEO optimization, 1-week delivery, and contact forms. Great for small businesses!',
            'Starter at $149 gets you a professionally designed website delivered in just 1 week. It\'s mobile-optimized, SEO-ready, and includes contact forms. Best for simple projects like landing pages or portfolios.'
        ];
    } else if (lowerMessage.includes('pro') || lowerMessage.includes('professional') || lowerMessage.includes('popular')) {
        responses = [
            'Pro package ($499) is our MOST POPULAR! 🔥 Includes everything in Starter PLUS custom animations, CMS integration, AI chatbot, analytics dashboard, and 2 weeks support. Perfect for full websites & web apps!',
            'The Professional plan at $499 is our best seller! You get AI chatbot integration, custom animations, CMS, analytics, and priority support. Ideal for growing brands and complete websites.'
        ];
    } else if (lowerMessage.includes('enterprise') || lowerMessage.includes('ecommerce') || lowerMessage.includes('e-commerce')) {
        responses = [
            'Enterprise ($999+) is for serious projects! Includes everything in Pro PLUS e-commerce functionality, advanced integrations, priority support, unlimited revisions, and white-label dashboard. Perfect for platforms & SaaS!',
            'For e-commerce, you\'ll want our Enterprise plan ($999+). It comes with secure payment processing, inventory management, product catalogs, and all Pro features. Plus unlimited revisions!'
        ];
    } else if (lowerMessage.includes('service') || lowerMessage.includes('what do you') || lowerMessage.includes('what can you')) {
        responses = [
            'We offer: Custom Websites ($149+), Landing Pages ($129), Portfolio Sites ($99), AI Chatbots ($49/mo), Email Automation ($49/mo), and E-commerce Solutions ($199+). All white-labeled for agencies!',
            'Our services include: 🚀 Website Design, 📱 Landing Pages, 💼 Portfolios, 🤖 AI Chatbots, 📧 Email Marketing, and 🛒 E-commerce. We\'re your secret weapon for amazing client projects!',
            'We specialize in white-label web development! Custom websites, landing pages, AI chatbots, email automation, and e-commerce stores. You keep the client relationship, we handle the technical execution.'
        ];
    } else if (lowerMessage.includes('delivery') || lowerMessage.includes('timeline') || lowerMessage.includes('how long') || lowerMessage.includes('how fast')) {
        responses = [
            'Delivery times: Starter packages in 1 week, Pro in 2 weeks, Enterprise 2-4 weeks depending on complexity. We pride ourselves on lightning-fast turnaround! ⚡',
            'We\'re super fast! Most projects: 1-2 weeks. Complex e-commerce or custom integrations: 2-4 weeks. Tell me about your project and I can give you an exact timeline!',
            'Speed is our thing! Landing pages & portfolios: 5-7 days. Full websites: 2 weeks. E-commerce platforms: 3-4 weeks. What\'s your ideal deadline?'
        ];
    } else if (lowerMessage.includes('chatbot') || lowerMessage.includes('ai bot')) {
        responses = [
            'Our AI Chatbot service ($49/mo) provides 24/7 customer support, lead qualification, and appointment scheduling. Included FREE in the Pro package! Want to see a demo?',
            'AI Chatbots are perfect for client websites! $49/mo standalone or FREE with Pro/Enterprise packages. They handle customer support, capture leads, and book appointments automatically. 🤖'
        ];
    } else if (lowerMessage.includes('white label') || lowerMessage.includes('whitelabel') || lowerMessage.includes('agency')) {
        responses = [
            'Everything we build is 100% white-labeled! No attribution to us. You present it as your own work, maintain the client relationship, and we stay invisible. Perfect for agencies and freelancers! 🎭',
            'We\'re your silent partner! All work is done under YOUR brand. Your clients never know we exist. You get professional questionnaires, the finished product for review, and ongoing support—all white-labeled.'
        ];
    } else if (lowerMessage.includes('support') || lowerMessage.includes('maintenance')) {
        responses = [
            'We provide ongoing support! Starter gets email support, Pro gets 2 weeks priority support, Enterprise gets unlimited support. We also offer maintenance packages to keep everything running smoothly! 🛠️',
            'Support is included in all packages! Plus we offer ongoing maintenance to keep your sites updated and secure. Enterprise clients get priority support 24/7.'
        ];
    } else if (lowerMessage.includes('technical') || lowerMessage.includes('code') || lowerMessage.includes('bug')) {
        responses = [
            'Our technical team specializes in custom development, bug fixes, and optimization. Can you describe the specific technical issue you\'re facing?',
            'For technical support, we have dedicated developers ready to help. What technology stack are you using?',
            'Technical issues can be resolved quickly. Please provide details about the error or issue you\'re experiencing.'
        ];
    } else if (lowerMessage.includes('process') || lowerMessage.includes('how it works') || lowerMessage.includes('workflow')) {
        responses = [
            'Our process is simple: 1️⃣ You bring the client, 2️⃣ We create the solution (white-labeled), 3️⃣ You review & deliver to your client, 4️⃣ We provide ongoing support. You stay in control!',
            'Here\'s how it works: You secure the client and gather requirements → We build it under your brand → You review and deliver → We support it. Seamless partnership! 🤝',
            'We make it easy! You handle client relationships, we handle technical execution. Everything is built under your brand with no attribution to us. You get all the credit!'
        ];
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('include') || lowerMessage.includes('what\'s included')) {
        responses = [
            'All plans include: mobile-first design, SEO optimization, and fast hosting. Pro adds: CMS, AI chatbot, analytics. Enterprise adds: e-commerce, integrations, unlimited revisions. What features do you need?',
            'Core features: responsive design, SEO, contact forms. Pro package includes AI chatbot, custom animations, CMS integration. Enterprise has advanced integrations and e-commerce. What\'s most important for your project?',
            'Every website includes: lightning-fast performance, mobile optimization, SEO, analytics. Upgrade to Pro for AI chatbot & CMS. Enterprise gets e-commerce, priority support, and white-label dashboard!'
        ];
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
        responses = [
            'You can reach us through the contact form on this page! Just fill it out with your project details and we\'ll get back to you within 24 hours. Or keep chatting with me—I can help! 💬',
            'Want to get started? Use our contact form below to tell us about your project. We typically respond within a few hours during business days. What type of project are you working on?'
        ];
    } else if (lowerMessage.includes('landing page') || lowerMessage.includes('portfolio')) {
        responses = [
            'Landing Pages start at $129 (high-converting, A/B testing included). Portfolio Sites start at $99 (custom galleries, case studies). Both include mobile design and SEO! Which interests you?',
            'We specialize in conversion-focused landing pages ($129) and stunning portfolio websites ($99). Both are delivered in about a week and include professional design and SEO optimization!'
        ];
    } else if (lowerMessage.includes('email automation') || lowerMessage.includes('newsletter')) {
        responses = [
            'Email Automation is $49/month! We set up automated sequences, newsletters, and marketing campaigns that convert subscribers into customers. Great for nurturing leads! 📧',
            'Our Email Automation service ($49/mo) includes: automated email sequences, newsletter templates, marketing campaigns, and analytics. Perfect for client retention and lead nurturing!'
        ];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        responses = [
            'Hey! 👋 Welcome to MeetCodeAI support. How can I help you today? Ask about our services, pricing, or technical support!',
            'Hello! Great to see you here. What would you like to know about our services?',
            'Hi there! 👋 I\'m here to help. What can I assist you with?'
        ];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('invoice') || lowerMessage.includes('subscription')) {
        responses = [
            'We accept all major credit cards and PayPal. Subscriptions can be cancelled anytime. Do you have questions about your current subscription?',
            'Billing is easy! You\'ll receive invoices via email. If you need to update your payment method, I can guide you through it.',
            'Our billing is transparent with no hidden fees. Let me help you with any payment or subscription questions!'
        ];
    } else if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('assist')) {
        responses = [
            'We\'re here to help 24/7! What specific area do you need support with?',
            'Our support team is always ready to assist. What\'s your main concern?',
            'Support is our priority! Tell me what you need help with.'
        ];
    } else {
        responses = [
            'That\'s a great question! Our team specializes in web development, AI integration, and digital solutions. Can you tell me more about what you\'re looking for?',
            'Interesting! To better assist you, could you provide more details about your project or requirements?',
            'I understand. Let me connect you with the right specialist. What\'s your main goal?',
            'Good point! Our team has extensive experience in that area. What specific outcome are you hoping to achieve?'
        ];
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
};

// Save user message and get AI response
exports.sendMessage = async (req, res, next) => {
    try {
        const { message, category } = req.body;
        const userId = req.user.id;
        const user = req.user;
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Message cannot be empty'
            });
        }
        
        // Save user message
        const userMessage = await ChatMessage.create({
            userId,
            userName: user.name,
            message: message.trim(),
            sender: 'user',
            category: category || 'general'
        });
        
        // Generate AI response
        const aiResponseText = getAIResponse(message);
        
        // Save AI response
        const aiMessage = await ChatMessage.create({
            userId,
            userName: 'MeetCodeAI Support',
            message: aiResponseText,
            sender: 'support',
            category: category || 'general'
        });
        
        res.status(200).json({
            status: 'success',
            data: {
                userMessage,
                aiMessage
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get chat history for user
exports.getChatHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = req.query.limit || 50;
        
        const messages = await ChatMessage.find({ userId })
            .sort({ createdAt: 1 })
            .limit(parseInt(limit));
        
        res.status(200).json({
            status: 'success',
            count: messages.length,
            data: { messages }
        });
    } catch (error) {
        next(error);
    }
};

// Clear chat history
exports.clearChatHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        await ChatMessage.deleteMany({ userId });
        
        res.status(200).json({
            status: 'success',
            message: 'Chat history cleared'
        });
    } catch (error) {
        next(error);
    }
};

// Get all chats (admin only)
exports.getAllChats = async (req, res, next) => {
    try {
        const messages = await ChatMessage.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(500);
        
        res.status(200).json({
            status: 'success',
            count: messages.length,
            data: { messages }
        });
    } catch (error) {
        next(error);
    }
};
