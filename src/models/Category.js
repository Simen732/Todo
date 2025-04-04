const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    color: {
        type: String,
        default: '#4285f4' // Default blue color
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;