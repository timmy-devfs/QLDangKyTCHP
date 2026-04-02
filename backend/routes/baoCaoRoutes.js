// ============================================================
// FILE: backend/routes/baoCaoRoutes.js
// PHẦN: TV-05 — Routes báo cáo
// Mount: app.use('/api/bao-cao', baoCaoRoutes)
// Tất cả báo cáo chỉ Admin mới xem được
// ============================================================

const express          = require('express');
const router           = express.Router();
const baoCaoController = require('../controllers/baoCaoController');
const authMiddleware   = require('../middleware/authMiddleware');
const { checkRole }    = require('../middleware/roleMiddleware');

// Áp dụng authMiddleware + checkRole cho toàn bộ router báo cáo
router.use(authMiddleware);
router.use(checkRole('Admin'));

// GET /api/bao-cao/thong-ke?maHK=HK1_2425
router.get('/thong-ke', baoCaoController.thongKe);

// GET /api/bao-cao/export?type=excel&maHK=HK1_2425
router.get('/export',   baoCaoController.exportExcel);

module.exports = router;