const { Pool } = require('pg')

const prodConfig = process.env.DATABASE_URL
const devConfig = {
    user: password.env.PG_USER,
    password: password.env.PG_PASSWORD,
    host: password.env.PG_HOST,
    database: password.env.PG_DATABASE,
    port: password.env.PG_PORT,
}

const pool = new Pool(process.env.NODE_ENV === 'production' ? prodConfig : devConfig)

module.exports = {
    query: (text, params) => pool.query(text, params),
}
