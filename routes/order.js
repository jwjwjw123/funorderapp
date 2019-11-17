const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const mysql = require('mysql');
const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');

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

// SQL Statements
const CREATE_ORDER = 'insert into orders (order_id, order_date, user_id) values (?, ?, ?)';
const CREATE_ORDER_DETAILS = 'insert into order_details (order_detail_id, product_id, quantity, order_id) values ?';
const SELECT_USER_ID_BY_EMAIL = 'select user_id from users where email = ?';
const createOrder = dbUtils.mkQuery(CREATE_ORDER);
const createOrderDetails = dbUtils.mkQuery(CREATE_ORDER_DETAILS);
const selectUserIdByEmail = dbUtils.mkQueryFromPool(dbUtils.mkQuery(SELECT_USER_ID_BY_EMAIL), pool);

const SELECT_ALL_ORDERS = "select orders.order_id, orders.order_date, users.email, order_detail_id, order_details.product_id, products.description, products.image_url, quantity from orders join order_details on orders.order_id = order_details.order_id join users on users.user_id = orders.user_id join products on products.product_id = order_details.product_id order by orders.order_id;";
const selectAllOrders = dbUtils.mkQueryFromPool(dbUtils.mkQuery(SELECT_ALL_ORDERS), pool);



const s3 = new aws.S3({
  endpoint: new aws.Endpoint('sgp1.digitaloceanspaces.com'),
  accessKeyId: spacesConfig.accessKey,
  secretAccessKey: spacesConfig.secret
});

router.post('/create', (req, res, next) => {
  selectUserIdByEmail(req.body.email)
    .then(
      (result) => {
        return new Promise((resolve, reject) => {
          if (result.length <= 0) {
            reject();
          }
          resolve(result[0].user_id);
        })
      })
    .then((user_id) => {
      const order_id = uuid();
      const newOrder = [order_id, req.body.order_date, user_id];
      const newOrderDetails = req.body.orderDetails.map(element => {
        return [uuid(), element.product.product_id, element.quantity, order_id];
      });
      console.log(newOrderDetails);
      pool.getConnection((error, connection) => {
        if (error) {
          return res.status(500).json({ message: "Internal server error" });
        }
        dbUtils.startTransaction(connection)
          .then(status => {
            return createOrder({ connection, params: newOrder })
          })
          .then(status => {
            return createOrderDetails({ connection, params: [newOrderDetails] });
          })
          .then(dbUtils.commit, dbUtils.rollback)
          .then(
            (status) => { res.status(201).json({ message: "Order created" }) },
            (status) => { res.status(500).json({ message: "Internal server error" }) }
          )
          .finally(() => { connection.release() });
      })
    })
})


router.get('/all', (req, res, next) => {
  selectAllOrders().then(
    (result) => {
      const orders = [];
      result.forEach(element => {
        let order;
        if (orders.length <= 0 || element.order_id !== orders[orders.length - 1]['order_id']) {
          order = {
            order_id: element.order_id,
            order_date: element.order_date,
            email: element.email,
            orderDetails: []
          };
        } else {
          order = orders.pop();
        }
        const orderDetail = {
          order_detail_id: element.order_detail_id,
          product: {
            product_id: element.product_id,
            description: element.description,
            image_url: 'https://valueshop.sgp1.digitaloceanspaces.com/images/' + element.image_url
          },
          quantity: element.quantity
        }
        order.orderDetails.push(orderDetail);
        orders.push(order);
      });
      res.status(200).type('application/json').json(orders);
    },
    (error) => {
      res.status(400).type('application/json').json({ error });
    })
});

module.exports = router;