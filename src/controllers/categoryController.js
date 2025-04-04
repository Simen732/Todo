const Category = require('../models/Category');
const Todo = require('../models/Todo');

class CategoryController {
    constructor() {
        this.getCategories = this.getCategories.bind(this);
        this.createCategory = this.createCategory.bind(this);
        this.updateCategory = this.updateCategory.bind(this);
        this.deleteCategory = this.deleteCategory.bind(this);
    }

    // Get all categories for the user
    async getCategories(req, res) {
        try {
            const categories = await Category.find({ user: req.user._id }).sort({ name: 1 });
            res.status(200).json(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ message: 'Error fetching categories', error });
        }
    }

    // Create a new category
    async createCategory(req, res) {
        try {
            const { name, color } = req.body;
            
            // Check if name is provided
            if (!name || name.trim() === '') {
                return res.status(400).json({ message: 'Category name is required' });
            }
            
            // Check if category with same name already exists
            const existingCategory = await Category.findOne({ 
                name: name.trim(), 
                user: req.user._id 
            });
            
            if (existingCategory) {
                return res.status(400).json({ message: 'Category with this name already exists' });
            }
            
            const category = new Category({
                name: name.trim(),
                color: color || '#4285f4',
                user: req.user._id
            });
            
            await category.save();
            
            res.status(201).json(category);
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ message: 'Error creating category', error });
        }
    }

    // Update a category
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, color } = req.body;
            
            if (!name || name.trim() === '') {
                return res.status(400).json({ message: 'Category name is required' });
            }
            
            const category = await Category.findOneAndUpdate(
                { _id: id, user: req.user._id },
                { name: name.trim(), color },
                { new: true }
            );
            
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            
            res.status(200).json(category);
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({ message: 'Error updating category', error });
        }
    }

    // Delete a category
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            
            // Find and delete the category
            const category = await Category.findOneAndDelete({
                _id: id,
                user: req.user._id
            });
            
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            
            // Remove category from todos that use it (set to null)
            await Todo.updateMany(
                { category: id, user: req.user._id },
                { $unset: { category: "" } }
            );
            
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ message: 'Error deleting category', error });
        }
    }
}

module.exports = new CategoryController();