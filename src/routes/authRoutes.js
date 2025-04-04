const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth'); // Add this import

// Add this near the top of the file
console.log("Auth routes loaded");

// Register routes
router.get('/register', (req, res) => {
    res.render('auth/register', { error: null, values: {} });
});
router.post('/register', authController.register);

// Login routes
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null, values: {} });
});
router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

// Profile route
router.get('/profile', authMiddleware, (req, res, next) => {
    console.log("Profile route accessed");
    authController.getProfile(req, res, next);
});

// Change password routes
router.get('/change-password', authMiddleware, authController.getChangePassword);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;