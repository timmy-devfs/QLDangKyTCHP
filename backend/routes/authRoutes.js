// ============================================================
// FILE: backend/routes/authRoutes.js
// PHẦN: TV-05 — Định nghĩa routes Auth
// Mount trong server.js: app.use('/api/auth', authRoutes)
// ============================================================

const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/login  — không cần middleware (chưa có token)
router.post('/login',  authController.login);

// POST /api/auth/logout — không cần middleware (stateless)
router.post('/logout', authController.logout);

// GET  /api/auth/me     — phải đăng nhập mới xem được
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;