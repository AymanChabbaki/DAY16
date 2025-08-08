/**
 * Error Handling Middleware
 * Catches and responds to any errors within the app
 */
const errorHandler = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    
    // Log the error
    console.error(`[${timestamp}] ERROR:`, err);
    
    // Default error status and message
    let status = err.status || err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
    } else if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid ID format';
    } else if (err.code === 'ENOENT') {
        status = 404;
        message = 'File not found';
    }
    
    // Send error response
    res.status(status).json({
        error: {
            message: message,
            status: status,
            timestamp: timestamp,
            path: req.originalUrl || req.url,
            method: req.method
        },
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
