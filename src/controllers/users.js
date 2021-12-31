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
            message: { error },
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
const updateUserName = async (req, res) => {
    const { newUserName, oldUserName } = req.body;
    try {
        const { rows } = await query('SELECT username FROM users WHERE username=$1', [oldUserName]);

        if (!rows[0]) {
            res.status(404).json({
                status: 'error',
                message: { error: 'User not found' },
            });
        } else {
            const { rows } = await query(
                'UPDATE users SET username=$1 WHERE username=$2 returning *',
                [newUserName, oldUserName]
            );

            res.status(200).json({
                status: 'update success',
                result: rows.length,
                newValues: rows[0],
            });
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUserName,
};
