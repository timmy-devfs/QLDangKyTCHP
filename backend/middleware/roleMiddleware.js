/**
 * roleMiddleware.js - Phan quyen theo vai tro
 * TV-05 phu trach
 */
module.exports = function(...roles) {
   return (req, res, next) => {
     if (!roles.includes(req.user?.vaiTro))
       return res.status(403).json({ message: 'Khong co quyen truy cap' });
     next();
   };
};