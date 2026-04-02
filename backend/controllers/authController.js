// ============================================================
// FILE: backend/controllers/authController.js
// PHẦN: TV-05 — Xử lý đăng nhập / đăng xuất
// MÔ TẢ: POST /api/auth/login  → xác minh bcrypt → tạo JWT
//        POST /api/auth/logout → client tự xóa token (stateless)
//        GET  /api/auth/me     → trả thông tin user hiện tại
// ============================================================

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const authCfg = require('../config/auth');
const db      = require('../config/db');  

// ============================================================
// login — POST /api/auth/login
// Body: { tenDangNhap, matKhau }
// ============================================================
const login = async (req, res) => {
    const { tenDangNhap, matKhau } = req.body;

    // 1. Validate input cơ bản
    if (!tenDangNhap || !matKhau) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập tên đăng nhập và mật khẩu.',
        });
    }

    try {
        // 2. Tìm tài khoản trong DB (chỉ lấy tài khoản đang active)
        const result = await db.execQuery(
            `SELECT MaTK, TenDangNhap, MatKhau, VaiTro,
                    MaSV, MaGV, TrangThai
             FROM TaiKhoan
             WHERE TenDangNhap = @tenDangNhap AND TrangThai = 1`,
            [{ name: 'tenDangNhap', type: 'NVarChar', value: tenDangNhap }]
        );

        // 3. Không tìm thấy tài khoản
        if (!result || result.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng.',
            });
        }

        const taiKhoan = result[0];

        // 4. So sánh mật khẩu với hash bcrypt trong DB
        //    bcrypt.compare() tự xử lý salt — không cần hash thủ công
        const matKhauHopLe = await bcrypt.compare(matKhau, taiKhoan.MatKhau);

        if (!matKhauHopLe) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng.',
            });
        }

        // 5. Tạo JWT payload — chỉ lưu thông tin cần thiết
        //    KHÔNG lưu mật khẩu vào payload!
        const payload = {
            maTK   : taiKhoan.MaTK,
            vaiTro : taiKhoan.VaiTro,
            maSV   : taiKhoan.MaSV,   // null nếu là GV hoặc Admin
            maGV   : taiKhoan.MaGV,   // null nếu là SV hoặc Admin
        };

        const token = jwt.sign(payload, authCfg.secret, {
            expiresIn: authCfg.expiresIn,
        });

        // 6. Trả token và thông tin cần thiết cho FE redirect
        return res.status(200).json({
            success : true,
            message : 'Đăng nhập thành công.',
            token,
            vaiTro  : taiKhoan.VaiTro,
            maSV    : taiKhoan.MaSV,
            maGV    : taiKhoan.MaGV,
        });

    } catch (err) {
        console.error('[authController.login]', err);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
        });
    }
};

// ============================================================
// logout — POST /api/auth/logout
// JWT là stateless — server không lưu session.
// FE cần tự xóa token khỏi localStorage.
// Endpoint này chỉ để FE có chỗ gọi rõ ràng.
// ============================================================
const logout = (req, res) => {
    return res.status(200).json({
        success : true,
        message : 'Đăng xuất thành công. Vui lòng xóa token ở phía client.',
    });
};

// ============================================================
// getMe — GET /api/auth/me
// Trả thông tin user đang đăng nhập (lấy từ req.user)
// Route này cần authMiddleware
// ============================================================
const getMe = async (req, res) => {
    try {
        // req.user đã được gắn bởi authMiddleware
        const { maTK, vaiTro, maSV, maGV } = req.user;

        // Lấy thêm thông tin hiển thị (tên, email) tùy vai trò
        let thongTin = null;

        if (maSV) {
            const rows = await db.execQuery(
                `SELECT MaSV, HoTen, Email, MaNganh FROM SinhVien WHERE MaSV = @id`,
                [{ name: 'id', type: 'Char', value: maSV }]
            );
            thongTin = rows[0] || null;
        } else if (maGV) {
            const rows = await db.execQuery(
                `SELECT MaGV, HoTen, Email, HocVi FROM GiangVien WHERE MaGV = @id`,
                [{ name: 'id', type: 'Char', value: maGV }]
            );
            thongTin = rows[0] || null;
        }

        return res.status(200).json({
            success: true,
            data: { maTK, vaiTro, maSV, maGV, ...thongTin },
        });

    } catch (err) {
        console.error('[authController.getMe]', err);
        return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
    }
};

module.exports = { login, logout, getMe };