const { query } = require('../db');
//initial path routes: '/api/users'

//get all users
const getUsers = async (req, res) => {
    try {
        const { rows } = await query('SELECT * FROM users');
        res.status(200).json({
            status: 'success',
            results: rows.length,
            users: rows,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
        console.log(error);
    }
};

//get users by id
const getUserById = async (req, res) => {
    try {
        const { rows } = await query('SELECT * FROM users WHERE id=$1', [req.params.id]);
        res.status(200).json({
            status: 'success',
            results: rows.length,
            users: rows,
        });
    } catch (error) {
        console.log(error);
    }
};

//create user
const createUser = async (req, res) => {
    const { name, email } = req.body;
    try {
        const { rows } = await query(
            'INSERT INTO users (nombre, correo) VALUES ($1, $2) returning *',
            [name, email]
        );
        res.status(200).json({
            status: 'success',
            results: rows.length,
            users: rows[0],
        });
    } catch (error) {
        console.log(error);
    }
};

//update user
const updateUser = async (req, res) => {};

module.exports = {
    getUsers,
    getUserById,
    createUser,
};
