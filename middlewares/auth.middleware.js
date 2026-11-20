const jwt = require('jsonwebtoken');
const blacklistModel = require('../models/blacklist.model');


async function authuser(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: 'token not found' });
    }

    if (!process.env.JWT_SECRET) {
        return next(new Error('JWT_SECRET is not configured.'));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const blacklistedToken = await blacklistModel.findOne({ token }).lean();
    if (blacklistedToken) {
        return res.status(401).json({ message: 'login required' });
    }

    req.user = decoded;
    return next();
}

module.exports = {authuser};