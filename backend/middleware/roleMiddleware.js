// ============================================================
// FILE: backend/middleware/roleMiddleware.js
// PHẦN: TV-05 — Phân quyền theo vai trò
// MÔ TẢ: Dùng SAU authMiddleware (req.user đã có).
//        checkRole('Admin') → chỉ Admin vào được
//        checkRole('GiangVien','Admin') → 2 vai trò đều vào được
//
// CÁCH DÙNG TRONG ROUTE:
//   router.get('/...', authMiddleware, checkRole('Admin'), controller)
// ============================================================

/**
 * checkRole — Higher-order function trả về middleware
 * @param  {...string} roles — danh sách vai trò được phép
 * @returns middleware function
 */
const checkRole = (...roles) => {
    return (req, res, next) => {
        // req.user được gắn bởi authMiddleware chạy trước
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Chưa xác thực.',
            });
        }

        // Kiểm tra vai trò của user có nằm trong danh sách được phép không
        if (!roles.includes(req.user.vaiTro)) {
            return res.status(403).json({
                success: false,
                message: `Bạn không có quyền thực hiện thao tác này. Yêu cầu vai trò: ${roles.join(' hoặc ')}.`,
            });
        }

        next();
    };
};

module.exports = { checkRole };