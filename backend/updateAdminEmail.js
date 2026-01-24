require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateAdminEmail = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Find the admin user
        const admin = await User.findOne({ role: 'admin' });
        
        if (!admin) {
            console.log('No admin user found');
            process.exit(1);
        }

        console.log('Current admin email:', admin.email);
        console.log('Current admin name:', admin.name);

        // Update the email
        const newEmail = 'team@meetcodeai.site';
        const newName = 'Sourav Mishra';

        admin.email = newEmail.toLowerCase().trim();
        admin.name = newName.trim();
        
        await admin.save({ validateBeforeSave: false });

        console.log('✓ Admin email updated successfully!');
        console.log('New email:', admin.email);
        console.log('New name:', admin.name);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

updateAdminEmail();
