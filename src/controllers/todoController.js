const Todo = require('../models/Todo');
const Category = require('../models/Category');
const { isToday, addDays } = require('../utils/dateHelpers');

class TodoController {
    constructor() {
        this.getTodos = this.getTodos.bind(this);
        this.createTodo = this.createTodo.bind(this);
        this.updateTodo = this.updateTodo.bind(this);
        this.toggleImportant = this.toggleImportant.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
        this.reorderTodos = this.reorderTodos.bind(this);
        this.updateTodoCategory = this.updateTodoCategory.bind(this);
    }

    // Get todos for specific date (default: today)
    async getTodos(req, res) {
        try {
            // Get date parameter or default to today
            const dateOffset = parseInt(req.query.dateOffset) || 0;
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + dateOffset);
            
            // Set start and end of the target day
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Get filter by category if provided - ENSURE it always has a value
            const categoryFilter = req.query.category || null;
            
            // Build query
            const query = {
                user: req.user._id,
                dueDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            };

            // Add category filter if provided
            if (categoryFilter) {
                query.category = categoryFilter;
            }
            
            // Get categories for this user - Make sure this is before the render call
            let categories = [];
            try {
                categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Continue with empty categories array
            }
            
            // Get todos with populated category
            const todos = await Todo.find(query)
                .populate('category')
                .sort({ order: 1, createdAt: -1 });
            
            res.render('todos/index', { 
                todos,
                categories, // Ensure categories is passed to the template
                currentDate: targetDate,
                dateOffset,
                nextDate: dateOffset + 1,
                prevDate: dateOffset - 1,
                isToday: isToday(targetDate),
                categoryFilter: categoryFilter // Explicitly pass the value
            });
        } catch (error) {
            console.error('Error fetching todos:', error);
            res.status(500).render('error', { 
                message: 'Error fetching todos',
                error
            });
        }
    }
    
    // Create new todo
    async createTodo(req, res) {
        try {
            const { title, description, dueDate, important, category } = req.body;
            
            // Validate input
            if (!title) {
                return res.redirect('/todos');
            }
            
            // Create new todo with important and category fields
            const todo = new Todo({
                title,
                description,
                dueDate: dueDate || Date.now(),
                important: important === 'true',
                category: category || null,
                user: req.user._id
            });
            
            await todo.save();
            
            res.redirect('/todos');
        } catch (error) {
            console.error('Error creating todo:', error);
            res.redirect('/todos');
        }
    }

    // Update todo category
    async updateTodoCategory(req, res) {
        try {
            const { id } = req.params;
            const { category } = req.body;
            
            const update = category ? { category } : { $unset: { category: "" } };
            
            const todo = await Todo.findOneAndUpdate(
                { _id: id, user: req.user._id },
                update,
                { new: true }
            );
            
            if (!todo) {
                return res.status(404).json({ message: 'Todo not found' });
            }
            
            res.status(200).json(todo);
        } catch (error) {
            console.error('Error updating todo category:', error);
            res.status(500).json({ message: 'Error updating todo category', error });
        }
    }

    // Toggle important status
    async toggleImportant(req, res) {
        try {
            const { id } = req.params;
            const { important } = req.body;
            
            const todo = await Todo.findOneAndUpdate(
                { _id: id, user: req.user._id },
                { important: important === 'true' },
                { new: true }
            );
            
            if (!todo) {
                return res.status(404).json({ message: 'Todo not found' });
            }
            
            res.redirect('/todos');
        } catch (error) {
            console.error('Error updating important status:', error);
            res.status(500).json({ message: 'Error updating todo', error });
        }
    }

    // Update todo status
    async updateTodo(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            const todo = await Todo.findOneAndUpdate(
                { _id: id, user: req.user._id },
                updates,
                { new: true }
            );
            
            if (!todo) {
                return res.status(404).json({ message: 'Todo not found' });
            }
            
            res.redirect('/todos');
        } catch (error) {
            console.error('Error updating todo:', error);
            res.status(500).json({ message: 'Error updating todo', error });
        }
    }

    // Delete todo
    async deleteTodo(req, res) {
        try {
            const { id } = req.params;
            
            const todo = await Todo.findOneAndDelete({
                _id: id,
                user: req.user._id
            });
            
            if (!todo) {
                return res.status(404).json({ message: 'Todo not found' });
            }
            
            res.redirect('/todos');
        } catch (error) {
            console.error('Error deleting todo:', error);
            res.status(500).json({ message: 'Error deleting todo', error });
        }
    }

    // Reorder todos
    async reorderTodos(req, res) {
        try {
            const { items } = req.body;
            
            // Validate input
            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ message: 'Invalid input' });
            }
            
            // Process each item in the reordered array
            const updatePromises = items.map((item, index) => {
                return Todo.findOneAndUpdate(
                    { _id: item.id, user: req.user._id },
                    { order: index },
                    { new: true }
                );
            });
            
            await Promise.all(updatePromises);
            
            res.status(200).json({ message: 'Tasks reordered successfully' });
        } catch (error) {
            console.error('Error reordering todos:', error);
            res.status(500).json({ message: 'Error reordering tasks', error });
        }
    }
}

module.exports = new TodoController();