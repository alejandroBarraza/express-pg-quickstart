const express = require('express');
const router = express.Router();
const { getAllUser } = require('../controllers/privateRoutes');
const { protected } = require('../middlewares/auth');

// Get routes private

router.get('/getAllUsers', protected, getAllUser);

module.exports = router;
