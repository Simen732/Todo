const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Add cookie clicker data
    cookieGame: {
        cookies: {
            type: Number,
            default: 0
        },
        multiplier: {
            type: Number,
            default: 1
        },
        cps: {
            type: Number,
            default: 0
        },
        // Track owned upgrades
        upgrades: {
            cursor: {
                count: { type: Number, default: 0 },
                nextCost: { type: Number, default: 10 }
            },
            grandma: {
                count: { type: Number, default: 0 },
                nextCost: { type: Number, default: 100 }
            },
            farm: {
                count: { type: Number, default: 0 },
                nextCost: { type: Number, default: 500 }
            },
            factory: {
                count: { type: Number, default: 0 },
                nextCost: { type: Number, default: 2000 }
            }
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);