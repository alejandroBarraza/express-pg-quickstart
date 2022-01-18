const { query } = require('../db');

const getAllUser = async (req, res) => {
    console.log(req.user);
    try {
        const { rows } = await query('SELECT * FROM users');
        res.status(200).json({ success: true, rows });
    } catch (error) {
        res.status(400).json({ success: false, error });
    }
};

module.exports = { getAllUser };
