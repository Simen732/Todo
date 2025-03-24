const Todo = require('../models/Todo');
const { isToday, addDays } = require('../utils/dateHelpers');

class TodoController {
    constructor(TodoModel) {
        this.TodoModel = TodoModel;
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
            
            // Fetch todos for the user on the specific date
            const todos = await this.TodoModel.find({
                user: req.user._id,
                dueDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).sort({ createdAt: -1 });
            
            res.render('todos/index', { 
                todos,
                currentDate: targetDate,
                dateOffset,
                nextDate: dateOffset + 1,
                prevDate: dateOffset - 1,
                isToday: isToday(targetDate)
            });
        } catch (error) {
            console.error('Error fetching todos:', error);
            res.status(500).render('error', { 
                message: 'Error fetching todos',
                error
            });
        }
    }
    
    // Show create todo form
    showCreateForm(req, res) {
        const today = new Date().toISOString().substr(0, 10); // Format: YYYY-MM-DD
        res.render('todos/create', { today });
    }

    // Create new todo
    async createTodo(req, res) {
        try {
            const { title, description, dueDate, important } = req.body;
            
            // Validate input
            if (!title) {
                return res.render('todos/create', {
                    error: 'Title is required',
                    values: req.body,
                    today: new Date().toISOString().substr(0, 10)
                });
            }
            
            // Create new todo with important field
            const todo = new this.TodoModel({
                title,
                description,
                dueDate: dueDate || Date.now(),
                important: important === 'true',
                user: req.user._id
            });
            
            await todo.save();
            
            res.redirect('/todos');
        } catch (error) {
            console.error('Error creating todo:', error);
            res.render('todos/create', {
                error: 'Error creating todo',
                values: req.body,
                today: new Date().toISOString().substr(0, 10)
            });
        }
    }

    // Toggle important status
    async toggleImportant(req, res) {
        try {
            const { id } = req.params;
            const { important } = req.body;
            
            const todo = await this.TodoModel.findOneAndUpdate(
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
            
            const todo = await this.TodoModel.findOneAndUpdate(
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
            
            const todo = await this.TodoModel.findOneAndDelete({
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
}

module.exports = new TodoController(Todo);