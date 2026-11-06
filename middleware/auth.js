const jwt = require('jsonwebtoken');
const User = require('../models/users_model');

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

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

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

        req.user = user;

        next();

    } catch (error) {
        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid or expired token'
            });
        }

        console.error(error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }
}


function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            status: 403,
            message: 'Admin permission required'
        });
    }

    next();
}

module.exports = {authenticateToken, authorizeAdmin};