const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`🔥 KGL Shades DB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}
module.exports = connectDB