const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

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

module.exports = router;