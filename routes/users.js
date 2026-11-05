var express = require('express');
var router = express.Router();
const userSchema = require('../models/users_model');


/* GET users listing. */
router.get('/', async function(req, res, next) {
try {
  let users = await userSchema.find();

  res.send(users)
} catch (error) {
  res.status(500).send(error.message);
}
});

module.exports = router;
