/**
 * Logging Middleware
 * Logs each request to the console including method, path, and timestamp
 */
const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
    
    // Log request body for POST and PUT requests
    if ((method === 'POST' || method === 'PUT') && Object.keys(req.body).length > 0) {
        console.log(`[${timestamp}] Request Body:`, JSON.stringify(req.body, null, 2));
    }
    
    next();
};

module.exports = logger;
