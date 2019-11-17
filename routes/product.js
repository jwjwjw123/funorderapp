const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const aws = require('aws-sdk');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');


const dbUtils = require('../utils/database.utils');

let dbConfigPath = '../config/database.config.js';
let spacesConfigPath = '../config/spaces.config.js';


let dbConfig;
let spacesConfig;

if (fs.existsSync(path.join(__dirname, dbConfigPath))) {
  console.log('using config file...');
  dbConfig = require(dbConfigPath);
  dbConfig.ssl = {
    ca: fs.readFileSync(dbConfig.ca_cert)
  }
} else {
  console.log('using env...');
  dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'valueshop',
    connectionLimit: 4,
    ssl: {
      ca: process.env.DB_CA
    }
  }
}

if (fs.existsSync(path.join(__dirname, spacesConfigPath))) {
  spacesConfig = require(spacesConfigPath);
} else {
  spacesConfig = {
    accessKey: process.env.S3_ACCESS_KEY,
		secretKey: process.env.S3_SECRET_KEY
  }
}


const pool = mysql.createPool(dbConfig);
const fileUpload = multer({ dest: path.join(__dirname, '../public/tmp') });

//SQL Statements
const INSERT_NEW_PRODUCT = 'insert into products (product_id, description, image_url) values (?, ?, ?)';
const insertNewProduct = dbUtils.mkQuery(INSERT_NEW_PRODUCT);

const UPDATE_PRODUCT = 'update products set description = ? where product_id = ?';
const updateProduct = dbUtils.mkQuery(UPDATE_PRODUCT);

const SELECT_ALL_PRODUCTS = 'select * from products';
const selectAllProducts = dbUtils.mkQueryFromPool(dbUtils.mkQuery(SELECT_ALL_PRODUCTS), pool);

// TO DO: update image_url
const SELECT_IMAGE_URL_FROM_PRODUCTS = 'select image_url from products where product_id = ?';
const selectImageUrl = dbUtils.mkQueryFromPool(dbUtils.mkQuery(SELECT_IMAGE_URL_FROM_PRODUCTS), pool);

const s3 = new aws.S3({
  endpoint: new aws.Endpoint('sgp1.digitaloceanspaces.com'),
  accessKeyId: spacesConfig.accessKey,
  secretAccessKey: spacesConfig.secret
});

router.post('/create', fileUpload.single('image-file'), (req, res, next) => {
  pool.getConnection((error, connection) => {
    if (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
    dbUtils.startTransaction(connection)
      .then(status => {
        const product_id = uuid();
        const values = [product_id, req.body.description, req.file.filename];
        return insertNewProduct({ connection: status.connection, params: values });
      })
      .then(status => {
        return new Promise((resolve, reject) => {
          fs.readFile(req.file.path, (error, imageFile) => {
            if (error) {
              return reject({ connection: status.connection, error: error });
            }
            const params = {
              Bucket: 'valueshop',
              Key: `images/${req.file.filename}`,
              Body: imageFile,
              ContentType: req.file.mimetype,
              ContentLength: req.file.size,
              ACL: 'public-read'
            };
            s3.putObject(params, (error, result) => {
              if (error) {
                return reject({ connection: status.connection, error });
              }
              resolve({ connection: status.connection, result });
            })
          })
        });
      })
      .then(dbUtils.commit, dbUtils.rollback)
      .then(status => {
        return new Promise((resolve, reject) => {
          fs.unlink(req.file.path, () => {
            res.status(201).json({ message: "Successfully created product" });
            resolve();
          })
        });
      }, status => {
        res.status(500).json({ message: "Internal server error", error: status.error });
      })
      .finally(() => connection.release());
  })
});

// TO DO: update image url 
router.post('/update', (req, res, next) => {
  console.log(req.body);
  pool.getConnection((error, connection) => {
    if (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
    dbUtils.startTransaction(connection)
      .then(status => {
        const values = [req.body.description, req.body.product_id]
        return updateProduct({ connection, params: values });
      })
      .then(dbUtils.commit, dbUtils.rollback)
      .then(
        status => {
          res.status(200).json({ message: "Product successfully updated" });
        },
        error => {  
          res.status(500).json({ message: "Internal server error"});
        }
      )
      .finally(() => connection.release());
  });
});

router.get('/all', (req, res, next) => {
  selectAllProducts()
    .then((result) => {
      result.map(element => {
        element.image_url = 'https://valueshop.sgp1.digitaloceanspaces.com/images/' + element.image_url;
      });
      res.status(200).json({ payload: result });
    })
    .catch((error) => {
      res.status(500).json({ message: "Internal server error" });
    })
});

router.get('/image/:product_id', (req, res, next) => {
  const product_id = req.params.product_id;
  selectImageUrl([product_id])
    .then(
      (result) => {
        if (result.length <= 0) {
          res.status(400).send('Image does not exist');
        }
        res.send(`https://valueshop.sgp1.digitaloceanspaces.com/images/${result[0].image_url}`);
      },
      (error) => {
        if (error) {
          res.status(500).send('Internal server error');
        }
      });
});

module.exports = router;

