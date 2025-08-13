const express = require('express');
const path = require('path');
const fs = require('fs');

// Import custom middleware
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Create data directory and posts.json if they don't exist
const dataDir = path.join(__dirname, 'data');
const postsFile = path.join(dataDir, 'posts.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

if (!fs.existsSync(postsFile)) {
    fs.writeFileSync(postsFile, JSON.stringify([], null, 2));
}


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Custom middleware
app.use(logger);

// Routes
app.use('/api/posts', postRoutes);

// Home route: serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The requested route ${req.originalUrl} does not exist`
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Blog API server is running on port ${PORT}`);
    console.log(`📖 API Documentation available at http://localhost:${PORT}`);
});

module.exports = app;
