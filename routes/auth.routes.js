const { Router } = require('express');
const authcontroller = require('../controller/auth.controller');
const authmiddleware = require('../middlewares/auth.middleware');

const authroutes = Router();

/**
 * @routes post /api/auth/register
 * @description Register a new user
 * @access Public
 */
authroutes.post("/register", authcontroller.registerUsercontroller);
/**
 * @routes post /api/auth/login
 * @description Login a user with email and password
 * @access Public
 */
authroutes.post("/login", authcontroller.loginUsercontroller);
/**
 * @routes get /api/auth/logout
 * @description Logout a user by clearing the token cookie
 * @access Public
 */
authroutes.get("/logout", authcontroller.logoutUser);
/**
 * @routes get /api/auth/get-me
 * @description Get the currently logged-in user's information
 * @access Private
 */
authroutes.get("/get-me",authmiddleware.authuser, authcontroller.getMe);
module.exports = authroutes;

