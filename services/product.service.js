const mysql = require('mysql');
const fs = require('fs');
const uuid = require('uuid');

const dbUtils = require('../utils/database.utils');
const dbConfig = require('../config/database.config');
const s3 = require("../config/spaces.config");

const pool = mysql.createPool(dbConfig);

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


module.exports = { createProduct, editProduct, getAllProducts, getImageByProductId };

function createProduct(req, res, next) {
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
}

// TODO: UPDATE IMAGE
function editProduct(req, res, next) {
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
          res.status(500).json({ message: "Internal server error" });
        }
      )
      .finally(() => connection.release());
  });
}

function getAllProducts(req, res, next) {
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
}

function getImageByProductId(req, res, next) {
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
}