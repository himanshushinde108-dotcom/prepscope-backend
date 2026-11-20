const usermodel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const blacklistModel = require('../models/blacklist.model');

const authCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
};

const clearAuthCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
};

/**
 * 
 * @name registerUser
 * @description Register a new user with email, username and password
 * @access Public
 */
async function registerUsercontroller(req, res) {

    const { email, username, password } = req.body;

    if (!email?.trim() || !username?.trim() || !password) {
        return res.status(400).json({ message: 'Email, username and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    const isuseralreadyexist = await usermodel.findOne({
        $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
    })
    
    if (isuseralreadyexist) {
        return res.status(409).json({ message: 'An account with those details already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);

    const newuser = await usermodel.create({
        email: normalizedEmail,
        username: normalizedUsername,
        password: hash
    });

    const token = createAuthToken(newuser._id);
 
    res.cookie('token', token, authCookieOptions)
    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: newuser._id,
            email: newuser.email,
            username: newuser.username
        }
    });

}
/**
 * @name loginUser
 * @description Login a user with email and password
 * @access Public
 */
async function loginUsercontroller(req, res) {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await usermodel.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createAuthToken(user._id);

    res.cookie('token', token, authCookieOptions);

    res.status(200).json({
        message: 'User logged in successfully',
        user: {
            id: user._id,
            email: user.email,
            username: user.username
        }
    });
}
/**
 * @name logoutUser
 * @description Logout a user by clearing the token cookie and blacklisting the token
 * @access Public
 */

async function logoutUser(req, res) {
    const token = req.cookies.token;
    if (!token) {
        res.clearCookie('token', clearAuthCookieOptions);
        return res.status(200).json({ message: 'User logged out successfully' });
    }

    await blacklistModel.create({ token });
    res.clearCookie('token', clearAuthCookieOptions);
    res.status(200).json({ message: 'User logged out successfully' });
}
/**
 * @name getMe
 * @description Get the currently logged-in user's information
 * @access Private
 */
async function getMe(req, res) {
    const user = await usermodel.findById(req.user.id) 
    if (!user) {
        return res.status(401).json({ message: 'Session user no longer exists.' });
    }

    res.status(200).json({
        message: 'User fetched successfully',
        user: { 
            id: user._id,
            email: user.email,
            username: user.username
        }
    });
}

function createAuthToken(userId) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured.');
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

module.exports ={
    registerUsercontroller,
    loginUsercontroller,
    logoutUser,
    getMe
}


