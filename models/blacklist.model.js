
const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

blacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

const blacklistModel = mongoose.model('Blacklist', blacklistSchema);
module.exports = blacklistModel;