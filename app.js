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
