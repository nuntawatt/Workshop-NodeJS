var express = require('express');
var router = express.Router();

const userSchema = require('../models/users_model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// method login
router.post('/login', async function(req, res, next) {
    try {
        const { username, password } = req.body;
        const user = await userSchema.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password'});
            // throw new Error('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password'});
        }

        // create token jwt
        const token = jwt.sign({
            userId: user._id,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET,{
            expiresIn: process.env.ACCESS_EXPIRESIN
        });

        // send jwt json
        return res.status(200).json({
            status: 200,
            message: 'Login Success',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            }
        });


    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// method register
router.post('/register', async function(req, res, next) {
    try {
        
        const { username, password } = req.body;

        // ตรวจสอบข้อมูลที่ส่งมา
        if (!username || !password) {
            return res.status(400).json({
                status: 400,
                message: 'Username and Password are required'
            })
        }

        // ตรวจสอบ username ซ่ำ
        const existingUser = await userSchema.findOne({ username });

        if (existingUser) {
            return res.status(409).json({
                status: 409,
                massage: 'Username already exists'
            })
        }

        // Hash Pass
        const hashPassword = await bcrypt.hash(password, 10);

        // สร้าง user ใหม่
        const user = await userSchema.create({
            username,
            password: hashPassword,
            role: 'user',
            is_approve: false
        })

        // create jwt token
        const token = jwt.sign({
            userId: user._id,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET,{
            expiresIn: process.env.ACCESS_EXPIRESIN
        });

        return res.status(201).json({
            status: 201,
            massage: 'Register Success',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    isApprove: user.is_approve
                }
            }
        });


    } catch (error) {
        console.error(error)

        res.status(500).json({ message: 'Internal server error' });
    }
});

// method approve
router.put('/:id/approve', async function(req, res, next){
    try{

        const { id } = req.params;

        // find user and edit status Approve
        const user = await userSchema.findByIdAndUpdate(
            id,
            {is_approve: true},
            {new: true}
        );

        if (!user) {
            return res.status(404).json({
                status: 404,
                massage: 'User not found'
            });
        }

        return res.status(200).json({
            status: 200,
            massage: 'Approve success',
            data: {
                id: user._id,
                username: user.username,
                role: user.role,
                is_approve: user.is_approve
            }
        });

    } catch (error) {
        console.error(error)

        res.status(500).json({ message: 'Internal server error' });
    }
})


module.exports = router;
