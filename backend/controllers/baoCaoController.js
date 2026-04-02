// ============================================================
// FILE: backend/controllers/baoCaoController.js
// PHẦN: TV-05 — Thống kê & xuất báo cáo Excel
// Endpoints:
//   GET /api/bao-cao/thong-ke?maHK=   — tổng quan đăng ký + tỉ lệ đạt/rớt
//   GET /api/bao-cao/export?type=excel — xuất Excel bảng điểm
// ============================================================

const db      = require('../config/db');
const ExcelJS = require('exceljs');  // npm install exceljs

// ============================================================
// thongKe — GET /api/bao-cao/thong-ke?maHK=HK1_2425
// Gọi 2 SP của TV-05 và trả JSON cho FE vẽ Chart.js
// ============================================================
const thongKe = async (req, res) => {
    const { maHK } = req.query;

    try {
        // Gọi SP thống kê đăng ký (TV-05)
        const dsDangKy = await db.execSP('sp_ThongKeDangKy',
            maHK ? [{ name: 'MaHocKy', type: 'Char', value: maHK }] : []
        );

        // Gọi SP thống kê kết quả học tập (TV-05)
        const dsKetQua = await db.execSP('sp_BaoCaoKetQuaHocTap',
            maHK ? [{ name: 'MaHocKy', type: 'Char', value: maHK }] : []
        );

        // Tính tổng hợp nhanh cho dashboard card
        const tongSVDangKy = dsDangKy.reduce((s, r) => s + (r.SoSVDangKy || 0), 0);
        const tongLop       = dsDangKy.length;
        const lopDayPhanTram = dsDangKy.filter(r => r.TiLeLapDay >= 90).length;

        return res.status(200).json({
            success: true,
            data: {
                tongHop: { tongSVDangKy, tongLop, lopDayPhanTram },
                chiTietDangKy : dsDangKy,
                chiTietKetQua : dsKetQua,
            },
        });

    } catch (err) {
        console.error('[baoCaoController.thongKe]', err);
        return res.status(500).json({ success: false, message: 'Lỗi khi lấy dữ liệu báo cáo.' });
    }
};

// ============================================================
// exportExcel — GET /api/bao-cao/export?type=excel&maHK=HK1_2425
// Xuất file Excel bảng điểm toàn bộ sinh viên trong HK
// ============================================================
const exportExcel = async (req, res) => {
    const { maHK } = req.query;

    try {
        // Lấy dữ liệu từ View V_BangDiemSinhVien
        // Dùng execQuery thay vì SP vì cần JOIN thêm MaHocKy
        const rows = await db.execQuery(
            `SELECT
                v.MaSV, v.TenSV, v.MaHP, v.TenHP, v.SoTinChi,
                v.TenHocKy, v.DiemQT, v.DiemThi, v.DiemTK, v.XepLoai
             FROM V_BangDiemSinhVien v
             JOIN LopHocPhan lhp ON v.MaLHP = lhp.MaLHP
             WHERE lhp.MaHocKy = @maHK
             ORDER BY v.MaSV, v.TenHP`,
            [{ name: 'maHK', type: 'Char', value: maHK || '' }]
        );

        // Tạo workbook ExcelJS
        const workbook  = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bảng Điểm');

        // Định nghĩa cột
        worksheet.columns = [
            { header: 'Mã SV',      key: 'MaSV',      width: 14 },
            { header: 'Họ Tên',     key: 'TenSV',      width: 30 },
            { header: 'Mã HP',      key: 'MaHP',       width: 12 },
            { header: 'Tên Học Phần', key: 'TenHP',    width: 40 },
            { header: 'Tín Chỉ',   key: 'SoTinChi',   width: 10 },
            { header: 'Học Kỳ',    key: 'TenHocKy',   width: 20 },
            { header: 'Điểm QT',   key: 'DiemQT',     width: 10 },
            { header: 'Điểm Thi',  key: 'DiemThi',    width: 10 },
            { header: 'Điểm TK',   key: 'DiemTK',     width: 10 },
            { header: 'Xếp Loại',  key: 'XepLoai',    width: 10 },
        ];

        // Style header row
        worksheet.getRow(1).eachCell(cell => {
            cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        worksheet.getRow(1).height = 20;

        // Thêm data và tô màu theo xếp loại
        rows.forEach(row => {
            const dataRow = worksheet.addRow(row);

            // Tô màu cột XepLoai
            const xepLoaiCell = dataRow.getCell('XepLoai');
            const colorMap = { A: 'FF00B050', B: 'FF70AD47', C: 'FFFFC000', D: 'FFED7D31', F: 'FFFF0000' };
            if (row.XepLoai && colorMap[row.XepLoai]) {
                xepLoaiCell.font = { bold: true, color: { argb: colorMap[row.XepLoai] } };
            }

            // Căn giữa các cột số
            ['DiemQT', 'DiemThi', 'DiemTK', 'XepLoai', 'SoTinChi'].forEach(col => {
                dataRow.getCell(col).alignment = { horizontal: 'center' };
            });
        });

        // Đặt tên file và gửi response
        const fileName = `BangDiem_${maHK || 'ToanBo'}_${Date.now()}.xlsx`;
        res.setHeader('Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error('[baoCaoController.exportExcel]', err);
        return res.status(500).json({ success: false, message: 'Lỗi khi xuất Excel.' });
    }
};

module.exports = { thongKe, exportExcel };