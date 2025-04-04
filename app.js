require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const authRoutes = require('./src/routes/authRoutes');
const todoRoutes = require('./src/routes/todoRoutes');
const connectDB = require('./src/config/db');
const { formatDate } = require('./src/utils/dateHelpers');
const expressLayouts = require('express-ejs-layouts');
const categoryRoutes = require('./src/routes/categoryRoutes');
const User = require('./src/models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.set('layout', 'layouts/app');

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Add date formatter to all views
app.locals.formatDate = formatDate;

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

// Make user data available to all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Add current route tracking
app.use((req, res, next) => {
    res.locals.currentRoute = req.path;
    res.locals.dateOffset = req.query.dateOffset ? parseInt(req.query.dateOffset) : 0;
    res.locals.title = 'Tasks'; // Default title
    next();
});

// Custom subdomain handling for forberedelse.[username].ikt-fag.no
app.use((req, res, next) => {
    const host = req.hostname;
    if (host.includes('forberedelse.') && host.includes('.ikt-fag.no')) {
        // Extract username from subdomain
        const username = host.split('.')[1];
        req.subdomainUsername = username;
    }
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);
app.use('/categories', categoryRoutes); // Make sure this line is present

// Add this immediately after the routes to verify the app is registering all routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path)
  }
});

// Home route - redirect to login if not authenticated
app.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    
    // Default to today's todos
    res.redirect('/todos');
});

// Handle subdomain route
app.get('/forberedelse.:username.ikt-fag.no/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    
    res.redirect('/todos');
});

// Add this with your other routes
app.get('/test-animations', (req, res) => {
    res.render('test-animations', { layout: false });
});

// Modified cookie-clicker route
app.get('/game/cookie-clicker', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    
    try {
        // Get user with their cookie data
        const user = await User.findById(req.session.userId);
        
        // Initialize cookieGame if it doesn't exist
        if (!user.cookieGame) {
            user.cookieGame = {
                cookies: 0,
                multiplier: 1,
                cps: 0,
                upgrades: {
                    cursor: { count: 0, nextCost: 10 },
                    grandma: { count: 0, nextCost: 100 },
                    farm: { count: 0, nextCost: 500 },
                    factory: { count: 0, nextCost: 2000 }
                },
                lastUpdated: new Date()
            };
            await user.save();
        }
        
        // Calculate offline progress
        const now = new Date();
        const timeDiff = (now - user.cookieGame.lastUpdated) / 1000; // seconds
        
        if (timeDiff > 5 && user.cookieGame.cps > 0) {
            // Calculate cookies earned while away (cap at 8 hours to prevent excessive cookies)
            const maxOfflineSeconds = 8 * 60 * 60; // 8 hours
            const offlineSeconds = Math.min(timeDiff, maxOfflineSeconds);
            const cookiesEarned = Math.floor(user.cookieGame.cps * offlineSeconds);
            
            if (cookiesEarned > 0) {
                user.cookieGame.cookies += cookiesEarned;
                user.cookieGame.lastUpdated = now;
                await user.save();
                
                // Add a notification message about offline earnings
                res.locals.offlineEarnings = cookiesEarned;
            }
        }
        
        // Store in session for quick access
        req.session.cookies = user.cookieGame.cookies;
        req.session.multiplier = user.cookieGame.multiplier;
        req.session.cps = user.cookieGame.cps;
        req.session.cookieUpgrades = user.cookieGame.upgrades;
        
        res.render('games/cookie-clicker', { 
            title: 'Cookie Clicker', 
            cookies: user.cookieGame.cookies,
            multiplier: user.cookieGame.multiplier,
            cps: user.cookieGame.cps,
            upgrades: user.cookieGame.upgrades
        });
    } catch (error) {
        console.error('Error loading cookie clicker:', error);
        res.status(500).render('error', { 
            message: 'Error loading cookie clicker', 
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Modified cookie-click endpoint
app.post('/game/cookie-click', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        // Update session first for quick response
        if (req.session.cookies === undefined) {
            // Initialize from database if first time
            const user = await User.findById(req.session.userId);
            req.session.cookies = user.cookieGame?.cookies || 0;
            req.session.multiplier = user.cookieGame?.multiplier || 1;
            req.session.cps = user.cookieGame?.cps || 0;
        }
        
        // Add cookies based on multiplier - ONLY update session
        req.session.cookies += req.session.multiplier;
        
        // Return updated cookie count
        res.json({ 
            cookies: req.session.cookies,
            multiplier: req.session.multiplier,
            cps: req.session.cps
        });
    } catch (error) {
        console.error('Error updating cookies:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Modified purchase-upgrade endpoint
app.post('/game/purchase-upgrade', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    const { upgradeId, cost, multiplier, cps } = req.body;
    
    try {
        // Initialize session if needed
        if (!req.session.cookies) {
            const user = await User.findById(req.session.userId);
            req.session.cookies = user.cookieGame?.cookies || 0;
            req.session.multiplier = user.cookieGame?.multiplier || 1;
            req.session.cps = user.cookieGame?.cps || 0;
            req.session.cookieUpgrades = user.cookieGame?.upgrades || {
                cursor: { count: 0, nextCost: 10 },
                grandma: { count: 0, nextCost: 100 },
                farm: { count: 0, nextCost: 500 },
                factory: { count: 0, nextCost: 2000 }
            };
        }
        
        // Check if player has enough cookies
        if (req.session.cookies >= cost) {
            // Deduct cost and add benefits
            req.session.cookies -= cost;
            if (multiplier) req.session.multiplier += multiplier;
            if (cps) req.session.cps += cps;
            
            // Update upgrade counters
            if (!req.session.cookieUpgrades) {
                req.session.cookieUpgrades = {};
            }
            
            if (!req.session.cookieUpgrades[upgradeId]) {
                req.session.cookieUpgrades[upgradeId] = { count: 0, nextCost: cost };
            }
            
            req.session.cookieUpgrades[upgradeId].count += 1;
            req.session.cookieUpgrades[upgradeId].nextCost = cost * 2; // Double cost for next purchase
            
            // Update database
            const updateData = {
                'cookieGame.cookies': req.session.cookies,
                'cookieGame.multiplier': req.session.multiplier,
                'cookieGame.cps': req.session.cps,
                'cookieGame.lastUpdated': new Date(),
                [`cookieGame.upgrades.${upgradeId}.count`]: req.session.cookieUpgrades[upgradeId].count,
                [`cookieGame.upgrades.${upgradeId}.nextCost`]: req.session.cookieUpgrades[upgradeId].nextCost
            };
            
            await User.findByIdAndUpdate(req.session.userId, updateData);
            
            res.json({
                cookies: req.session.cookies,
                multiplier: req.session.multiplier,
                cps: req.session.cps,
                upgrades: req.session.cookieUpgrades
            });
        } else {
            res.status(400).json({ error: 'Not enough cookies' });
        }
    } catch (error) {
        console.error('Error purchasing upgrade:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Modified passive-income endpoint - update this existing endpoint
app.post('/game/passive-income', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        // Initialize if needed
        if (req.session.cookies === undefined) {
            const user = await User.findById(req.session.userId);
            req.session.cookies = user.cookieGame?.cookies || 0;
            req.session.multiplier = user.cookieGame?.multiplier || 1;
            req.session.cps = user.cookieGame?.cps || 0;
        }
        
        // Add cookies from passive income - ONLY update session, NOT database
        req.session.cookies += req.session.cps;
        
        res.json({
            cookies: req.session.cookies,
            multiplier: req.session.multiplier,
            cps: req.session.cps
        });
    } catch (error) {
        console.error('Error updating passive income:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add this new route to app.js
app.post('/game/save-game', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    
    try {
        // Get the current game state from the request
        const { cookies, multiplier, cps } = req.body;
        
        // Update session data
        req.session.cookies = cookies;
        req.session.multiplier = multiplier;
        req.session.cps = cps;
        
        // Save to database
        await User.findByIdAndUpdate(req.session.userId, {
            'cookieGame.cookies': cookies,
            'cookieGame.multiplier': multiplier,
            'cookieGame.cps': cps,
            'cookieGame.lastUpdated': new Date()
        });
        
        res.json({ success: true, message: 'Game saved successfully' });
    } catch (error) {
        console.error('Error saving game:', error);
        res.status(500).json({ error: 'Failed to save game' });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
