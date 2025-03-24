const bcrypt = require('bcrypt');
const User = require('../models/User');

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
}

module.exports = new AuthController();