const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authMiddleware = require('../middlewares/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET routes
router.get('/', todoController.getTodos); // Default today's todos

// POST routes
router.post('/', todoController.createTodo);

// PUT routes
router.put('/reorder', todoController.reorderTodos); // This specific route must come BEFORE the /:id route
router.put('/:id', todoController.updateTodo);
router.put('/:id/important', todoController.toggleImportant);
router.put('/:id/category', todoController.updateTodoCategory);

// DELETE route
router.delete('/:id', todoController.deleteTodo);

module.exports = router;