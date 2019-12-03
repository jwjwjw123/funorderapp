require('dotenv').config();
const express = require('express');
const router = express.Router();
const uuid = require('uuid');

const { getAllOrders, createOrder } = require('../services/order.service');

router.post('/create', createOrder);
router.get('/all', getAllOrders);



module.exports = router;