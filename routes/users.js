var express = require('express');
var router = express.Router();

const userSchema = require('../models/users_model');


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
