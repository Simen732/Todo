const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET routes - specific routes first
router.get('/manage', (req, res, next) => {
    try {
        console.log("Categories manage route accessed");
        res.render('categories/index', { 
            title: 'Manage Categories',
            currentRoute: '/categories/manage'
        });
    } catch (error) {
        console.error("Error rendering categories page:", error);
        next(error);
    }
});

// Then other GET routes
router.get('/', categoryController.getCategories);

// Then POST routes
router.post('/', categoryController.createCategory);

// Then PUT and DELETE routes
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;