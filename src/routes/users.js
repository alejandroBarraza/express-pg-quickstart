const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser } = require('../controllers/users.js');

//initial path routes: '/api/users'

//user get routes
router.get('/', getUsers);
router.get('/:id', getUserById);

//user post routes
router.post('/', createUser);

//user delete routes

//user update routes
module.exports = router;
