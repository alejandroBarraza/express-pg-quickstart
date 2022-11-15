// imports
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const errorHandler = require('./middlewares/error')

// Express init
const app = express()
const PORT = process.env.PORT || 4000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//User routes middleware
// app.use('/api/user', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'))
app.use('/api/privated', require('./routes/privateRoutes'))

//Error handler middleware
app.use(errorHandler)

//Launch Server
console.log('REST API Backend Service Launching...')
console.log('----------------------------------------------')

//Express Startup
app.listen(PORT, () => {
    console.log(`[OK] Express listening on port ${PORT}`)
})
