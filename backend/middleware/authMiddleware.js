/**
 * authMiddleware.js - Xac thuc JWT tren moi request
 * TV-05 phu trach
 */
const { verify } = require('../config/auth');

module.exports = function(req, res, next) {
   const header = req.headers['authorization'] || '';
   const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
   if (!token) return res.status(401).json({ message: 'Chua dang nhap' });
   try {
     req.user = verify(token);
     next();
   } catch { res.status(401).json({ message: 'Token khong hop le hoac het han' }); }
};