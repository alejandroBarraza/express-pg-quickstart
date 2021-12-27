require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Express init
const app = express();
const PORT = process.env.PORT || APP_PORT;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//User routes
app.use('/api/user', require('./routes/users'));

//Launch Server
console.log('miStock REST API Backend Service Launching...');
console.log('----------------------------------------------');

//Express Startup
app.listen(PORT, () => {
    console.log(`[OK] Express listening on port ${PORT}`);
});
