const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const db = require('../utils/database.utils');
const config = require('../config/database.config');

const pool = mysql.createPool(config);

// Test data
// const newOrder = [new Date(), 'barney@gmail.com'];
// const newOrderDetails = [
//   ['apple', 20],
//   ['orange', 30],
//   ['grapes', 10],
//   ['grapefruit', 15]
// ];

const CREATE_ORDER = 'insert into orders(order_date, email) values (?, ?)';
const SELECT_LAST_INSERTED_ORDER_ID = 'select last_insert_id() as order_id from orders';
const CREATE_ORDER_DETAILS = 'insert into line_item(order_id, description, quantity) values ?';
const SELECT_ORDER_BY_ORDER_ID = 'select * from orders join line_item on orders.order_id = line_item.order_id where orders.order_id = ?';

const createOrder = db.mkQuery(CREATE_ORDER);
const getLastInsertedOrderId = db.mkQuery(SELECT_LAST_INSERTED_ORDER_ID);
const createOrderDetails = db.mkQuery(CREATE_ORDER_DETAILS);

const getOrderByOrderId = db.mkQueryFromPool(db.mkQuery(SELECT_ORDER_BY_ORDER_ID), pool);

router.post('/order/create', function (req, res, next) {
  console.log(req.body);
  pool.getConnection((error, connection) => {
    if (error) {
      res.status(500).json({});
    }
    db.startTransaction(connection)
      .then(status => {
        return createOrder({
          connection: status.connection,
          params: [req.body.order_date, req.body.email]
        });
      })
      .then(getLastInsertedOrderId)
      .then(status => {
        const order_id = status.result[0].order_id;
        const newOrderDetails = req.body.orderDetails.map(element => {
          const newOrderDetail = [order_id, element.description, element.quantity];
          return newOrderDetail;
        })
        console.log(newOrderDetails);
        return createOrderDetails({ connection: status.connection, params: [newOrderDetails] });
      })
      .then(db.commit)
      .catch(db.rollback)
      .finally(() => {
        connection.release();
        res.json({ message: 'finally here' });
      })
  })
});

router.get('/order/:id', (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  getOrderByOrderId(id)
    .then(result => {
      const order = {
        order_id: result[0].order_id,
        order_date: result[0].order_date,
        email: result[0].email,
        orderDetails: []
      };
      order.orderDetails = result.map(element => {
        const orderDetail = {
          item_id: element.item_id,
          order_id: id,
          description: element.description,
          quantity: element.quantity
        }
        return orderDetail;
      });

      console.log(order);
      res.json(order);
    })
    .catch(error => {
      console.log(error);
      res.json(error);
    })
});

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
