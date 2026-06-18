require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = Process.env.PORT || 5000; // Common port for Node backends

// Middleware to parse JSON bodies (similar to Django's JSONParser)
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// A simple test route



app.get('/api/health', (req, res) => {
    res.json({ status: "success", message: "KGL Shades API is running smoothly!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is buzzing on http://localhost:${PORT}`);
});