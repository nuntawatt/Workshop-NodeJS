const jwt = require('jsonwebtoken');
const User = require('../models/users_model');

// ตรวจสอบ Token และสถานะ User
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                status: 401,
                message: 'Access token is required'
            });
        }

        // token ผิดหรือหมดอายุ จะ throw ไปที่ catch
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ค้น user ทุกครั้ง เผื่อถูกลบหรือถูกระงับหลังออก token
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: 'User not found'
            });
        }

        if (!user.is_approve) {
            return res.status(403).json({
                status: 403,
                message: 'Your account is not approved'
            });
        }

        // เก็บข้อมูล User ไว้ใช้ใน Route
        req.user = user;

        // ไปต่อ ถ้าไม่เรียก request จะค้าง
        next();

    } catch (error) {
        // token มีปัญหาจะส่ง 401
        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid or expired token'
            });
        }

        // ให้ log error เผื่อ database ล่ม จะส่ง 500
        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }
}

// ตรวจสอบสิทธิ์ Admin
function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            status: 403,
            message: 'Admin permission required'
        });
    }

    next();
}

module.exports = {
    authenticateToken,
    authorizeAdmin
};