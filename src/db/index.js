const { Pool } = require('pg')

const prodConfig = process.env.DATABASE_URL
const devConfig = {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
}

const pool = new Pool(process.env.NODE_ENV === 'production' ? prodConfig : devConfig)

module.exports = {
    query: (text, params) => pool.query(text, params),
}
