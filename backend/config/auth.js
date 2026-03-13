/**
 * auth.js - Cau hinh JWT
 * TV-05 phu trach
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET  || 'default_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

module.exports = {
   sign(payload)  { return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES }); },
   verify(token)  { return jwt.verify(token, JWT_SECRET); },
};