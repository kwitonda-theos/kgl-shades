const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI?.trim();

        if (!mongoUri) {
            throw new Error(
                'MONGODB_URI is not configured. Add it to the backend .env file before starting the server.'
            );
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`🔥 KGL Shades DB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;