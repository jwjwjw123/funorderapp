const express = require('express');
const router = express.Router();
const passport = require('passport')
require('../config/passport.config')(passport);

const { signInUser } = require('../services/user.service');


router.post('/create', (req, res, next) => {

});

router.post('/authenticate', signInUser);

router.get('/login', (req, res, next) => {
  res.json({ message: "failed" });
})

module.exports = router;
