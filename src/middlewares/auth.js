const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Check if user is authenticated via session
        if (!req.session.userId) {
            return res.redirect('/auth/login');
        }

        // Find user by ID
        const user = await User.findById(req.session.userId);
        if (!user) {
            // Clear invalid session
            req.session.destroy();
            return res.redirect('/auth/login');
        }

        // Add user to request
        req.user = user;
        res.locals.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).redirect('/auth/login');
    }
};

module.exports = authMiddleware;