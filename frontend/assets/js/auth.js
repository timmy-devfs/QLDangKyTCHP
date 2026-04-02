// ============================================================
// FILE: frontend/assets/js/auth.js
// PHẦN: TV-05 — Quản lý JWT phía client
// MÔ TẢ: Lưu/đọc token, kiểm tra đăng nhập, redirect đúng trang
//        TV-02/03/04 dùng getToken() từ file này khi gọi API
// ============================================================

const AUTH_KEY    = 'qlhp_token';
const VAITRO_KEY  = 'qlhp_vaitro';
const MASV_KEY    = 'qlhp_masv';
const MAGV_KEY    = 'qlhp_magv';

// ============================================================
// Lưu token và thông tin sau khi đăng nhập thành công
// ============================================================
function saveAuthInfo({ token, vaiTro, maSV, maGV }) {
    localStorage.setItem(AUTH_KEY,   token);
    localStorage.setItem(VAITRO_KEY, vaiTro);
    if (maSV) localStorage.setItem(MASV_KEY, maSV);
    if (maGV) localStorage.setItem(MAGV_KEY, maGV);
}

// ============================================================
// Lấy token để gắn vào header — api.js của TV-02 dùng hàm này
// ============================================================
function getToken() {
    return localStorage.getItem(AUTH_KEY);
}

function getVaiTro() {
    return localStorage.getItem(VAITRO_KEY);
}

function getMaSV() {
    return localStorage.getItem(MASV_KEY);
}

function getMaGV() {
    return localStorage.getItem(MAGV_KEY);
}

// ============================================================
// Kiểm tra đã đăng nhập chưa (token tồn tại)
// Lưu ý: không decode JWT ở đây — chỉ kiểm tra có token không.
// Verify thực sự xảy ra ở server mỗi request.
// ============================================================
function isLoggedIn() {
    return !!localStorage.getItem(AUTH_KEY);
}

// ============================================================
// Xóa toàn bộ thông tin đăng nhập
// ============================================================
function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(VAITRO_KEY);
    localStorage.removeItem(MASV_KEY);
    localStorage.removeItem(MAGV_KEY);
    window.location.href = '/index.html';
}

// ============================================================
// Redirect về đúng dashboard theo vai trò
// ============================================================
function redirectByRole(vaiTro) {
    const map = {
        'Admin'      : '/admin/dashboard.html',
        'GiangVien'  : '/gv/nhap-diem.html',
        'SinhVien'   : '/sv/dang-ky.html',
    };
    window.location.href = map[vaiTro] || '/index.html';
}

// ============================================================
// Bảo vệ trang — gọi ở đầu mỗi trang cần đăng nhập
// Nếu chưa đăng nhập → quay về trang login
// requireRole: nếu truyền vào thì kiểm tra thêm vai trò
// ============================================================
function requireAuth(requireRole = null) {
    if (!isLoggedIn()) {
        window.location.href = '/index.html';
        return false;
    }
    if (requireRole && getVaiTro() !== requireRole) {
        alert('Bạn không có quyền truy cập trang này.');
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// ============================================================
// Xử lý form đăng nhập — gọi từ index.html
// ============================================================
async function handleLogin(event) {
    event.preventDefault();

    const tenDangNhap = document.getElementById('tenDangNhap').value.trim();
    const matKhau     = document.getElementById('matKhau').value;
    const errorEl     = document.getElementById('loginError');

    if (!tenDangNhap || !matKhau) {
        errorEl.textContent = 'Vui lòng nhập đầy đủ thông tin.';
        errorEl.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method  : 'POST',
            headers : { 'Content-Type': 'application/json' },
            body    : JSON.stringify({ tenDangNhap, matKhau }),
        });

        const data = await response.json();

        if (data.success) {
            // Lưu token và thông tin
            saveAuthInfo(data);
            // Redirect theo vai trò
            redirectByRole(data.vaiTro);
        } else {
            errorEl.textContent = data.message || 'Đăng nhập thất bại.';
            errorEl.style.display = 'block';
        }
    } catch (err) {
        errorEl.textContent = 'Không thể kết nối máy chủ. Vui lòng thử lại.';
        errorEl.style.display = 'block';
    }
}