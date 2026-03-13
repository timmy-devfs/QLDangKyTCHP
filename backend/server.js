/**
 * server.js - Diem khoi chay chinh
 * TV-02 phu trach
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors    = require('cors');
const { connectDB } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(require('path').join(__dirname, '../frontend')));

/* Routes */
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/sinh-vien',     require('./routes/sinhVienRoutes'));
app.use('/api/giang-vien',    require('./routes/giangVienRoutes'));
app.use('/api/hoc-phan',      require('./routes/hocPhanRoutes'));
app.use('/api/lop-hoc-phan',  require('./routes/lopHocPhanRoutes'));
app.use('/api/hoc-ky',        require('./routes/hocKyRoutes'));
app.use('/api/dang-ky',       require('./routes/dangKyRoutes'));
app.use('/api/diem',          require('./routes/diemRoutes'));
app.use('/api/bao-cao',       require('./routes/baoCaoRoutes'));

/* Error handler */
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
   app.listen(PORT, () => console.log(`Server dang chay tai http://localhost:${PORT}`));
}).catch(err => { console.error('Loi ket noi DB:', err); process.exit(1); });