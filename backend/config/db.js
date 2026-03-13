/**
 * db.js - Ket noi SQL Server dung mssql
 * TV-02 phu trach
 */
const sql = require('mssql');

const config = {
   server:   process.env.DB_SERVER   || 'localhost',
   database: process.env.DB_NAME     || 'QLDangKyHP',
   user:     process.env.DB_USER     || 'sa',
   password: process.env.DB_PASSWORD || '',
   port:     parseInt(process.env.DB_PORT) || 1433,
   options:  { encrypt: false, trustServerCertificate: true }
};

let pool;

async function connectDB() {
   pool = await sql.connect(config);
   console.log('Ket noi SQL Server thanh cong');
   return pool;
}

async function execQuery(query, params = {}) {
   const req = pool.request();
   Object.entries(params).forEach(([k, v]) => req.input(k, v));
   return req.query(query);
}

async function execSP(spName, params = {}) {
   const req = pool.request();
   Object.entries(params).forEach(([k, v]) => req.input(k, v));
   return req.execute(spName);
}

module.exports = { connectDB, execQuery, execSP, sql };