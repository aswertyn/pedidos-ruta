const path = require('node:path')
const sql = require('mssql')

require('dotenv').config({
    path: path.join(__dirname, '..', '.env'),
})

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
}

const poolPromise = new sql.ConnectionPool(dbConfig).connect()

module.exports = {
    sql,
    poolPromise,
}