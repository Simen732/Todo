const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    dueDate: {
        type: Date,
        required: false,
    },
    completed: {
        type: Boolean,
        default: false
    },
    important: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;