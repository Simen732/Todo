const bcrypt = require('bcrypt');
const User = require('../models/User');
const Todo = require('../models/Todo'); // Add this import for task count

class AuthController {
    // Register a new user
    async register(req, res) {
        try {
            const { username, password, email } = req.body;
            
            // Check if user already exists
            const userExists = await User.findOne({ 
                $or: [{ username }, { email }]
            });
            
            if (userExists) {
                return res.render('auth/register', { 
                    error: 'Username or email already exists',
                    values: { username, email }
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Create new user
            const newUser = new User({
                username,
                email,
                password: hashedPassword
            });
            
            await newUser.save();
            
            // Set session
            req.session.userId = newUser._id;
            req.session.user = {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email
            };
            
            res.redirect('/todos');
        } catch (error) {
            console.error('Register error:', error);
            res.render('auth/register', { 
                error: 'Error registering user',
                values: req.body
            });
        }
    }

    // User login - changed to use email instead of username
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Find user by email instead of username
            const user = await User.findOne({ email });
            if (!user) {
                return res.render('auth/login', { 
                    error: 'Invalid email or password',
                    values: { email }
                });
            }
            
            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.render('auth/login', { 
                    error: 'Invalid email or password',
                    values: { email }
                });
            }
            
            // Set session
            req.session.userId = user._id;
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email
            };
            
            res.redirect('/todos');
        } catch (error) {
            console.error('Login error:', error);
            res.render('auth/login', { 
                error: 'Error during login',
                values: req.body
            });
        }
    }

    // User logout
    logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/auth/login');
        });
    }

    // Add these methods to your authController
    getChangePassword(req, res) {
        res.render('auth/change-password', {
            title: 'Change Password'
        });
    }

    async changePassword(req, res) {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        try {
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                return res.render('auth/change-password', {
                    title: 'Change Password',
                    errorMessage: 'New passwords do not match'
                });
            }
            
            // Get user from database to verify password
            const user = await User.findById(req.user._id);
            
            // Check current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.render('auth/change-password', {
                    title: 'Change Password',
                    errorMessage: 'Current password is incorrect'
                });
            }
            
            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            
            return res.render('auth/change-password', {
                title: 'Change Password',
                successMessage: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Error changing password:', error);
            res.render('auth/change-password', {
                title: 'Change Password',
                errorMessage: 'An error occurred while changing your password'
            });
        }
    }

    // Add this new method
    async getProfile(req, res) {
        try {
            // Count user's tasks
            const taskCount = await Todo.countDocuments({ user: req.user._id });
            
            res.render('auth/profile', {
                title: 'Your Profile',
                user: req.user,
                taskCount
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).render('error', { 
                message: 'Error loading profile', 
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }
}

module.exports = new AuthController();