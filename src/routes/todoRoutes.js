const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authMiddleware = require('../middlewares/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET routes
router.get('/', todoController.getTodos); // Default today's todos
router.get('/create', todoController.showCreateForm);

// POST routes
router.post('/', todoController.createTodo);

// PUT routes
router.put('/:id', todoController.updateTodo);
router.put('/:id/important', todoController.toggleImportant); // New route for toggling important status

// DELETE route
router.delete('/:id', todoController.deleteTodo);

module.exports = router;