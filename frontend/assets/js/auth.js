/**
 * auth.js - Xu ly dang nhap / dang xuat / JWT
 * TV-05 phu trach
 */
const auth = {
   login(token, user) {
     localStorage.setItem('jwt_token', token);
     localStorage.setItem('current_user', JSON.stringify(user));
   },
   logout() {
     localStorage.removeItem('jwt_token');
     localStorage.removeItem('current_user');
     window.location.href = '/frontend/index.html';
   },
   getToken() { return localStorage.getItem('jwt_token'); },
   getUser()  { return JSON.parse(localStorage.getItem('current_user') || 'null'); },
   isLoggedIn() { return !!this.getToken(); },
   redirectByRole(role) {
     const map = { 'Admin': '/frontend/admin/dashboard.html',
                   'GiangVien': '/frontend/gv/lop-hoc-phan.html',
                   'SinhVien': '/frontend/sv/dang-ky.html' };
     window.location.href = map[role] || '/frontend/index.html';
   }
};

/* Login form handler */
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
   e.preventDefault();
   try {
     const data = await api.post('/auth/login', {
       tenDangNhap: document.getElementById('username').value,
       matKhau:     document.getElementById('password').value
     });
     auth.login(data.token, data.user);
     auth.redirectByRole(data.user.vaiTro);
   } catch (err) {
     document.getElementById('errorMsg').textContent = err.message || 'Dang nhap that bai';
   }
});