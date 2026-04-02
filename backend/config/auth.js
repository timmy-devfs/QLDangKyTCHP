// ============================================================
// FILE: backend/config/auth.js
// PHẦN: TV-05 — Cấu hình JWT
// MÔ TẢ: Tập trung secret + thời hạn token vào 1 chỗ
//        Không hardcode secret trong controller
// ============================================================

require('dotenv').config();

module.exports = {
    // JWT_SECRET phải có trong file .env
    // VD: JWT_SECRET=uth_qlhp_super_secret_key_2025
    secret: process.env.JWT_SECRET || 'default_dev_secret_change_in_prod',

    // Token hết hạn sau 8 tiếng (1 ngày học)
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
};