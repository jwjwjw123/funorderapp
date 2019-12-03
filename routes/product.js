require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  createProduct,
  editProduct,
  getAllProducts,
  getImageByProductId
} = require('../services/product.service');

const fileUpload = multer({ dest: path.join(__dirname, '../public/tmp') });

router.post('/create', fileUpload.single('image-file'), createProduct);
router.post('/update', editProduct);
router.get('/all', getAllProducts);
router.get('/image/:product_id', getImageByProductId);

module.exports = router;

