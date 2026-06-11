const express = require('express');
const app = express();
const PORT = 5000; // Common port for Node backends

// Middleware to parse JSON bodies (similar to Django's JSONParser)
app.use(express.json());

// A simple test route
app.get('/api/health', (req, res) => {
    res.json({ status: "success", message: "KGL Shades API is running smoothly!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is buzzing on http://localhost:${PORT}`);
});