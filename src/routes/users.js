const express = require('express')
const router = express.Router()
const { getUsers, getUserById, createUser, updateUserName } = require('../controllers/users.js')

//initial path routes: '/api/user'

//user get routes
router.get('/getUsers', getUsers)
router.get('/:id', getUserById)

//user post routes
router.post('/', createUser)

//user delete routes

//user update routes
router.put('/updatebyUserName', updateUserName)

module.exports = router
