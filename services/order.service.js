const mysql = require('mysql');

const dbUtils = require('../utils/database.utils');

const dbConfig = require('../config/database.config');
const spacesConfig = require('../config/spaces.config');

const pool = mysql.createPool(dbConfig);

// SQL Statements
const INSERT_ORDER = 'insert into orders (order_id, order_date, user_id) values (?, ?, ?)';
const INSERT_ORDER_DETAILS = 'insert into order_details (order_detail_id, product_id, quantity, order_id) values ?';
const SELECT_USER_ID_BY_EMAIL = 'select user_id from users where email = ?';
const insertOrder = dbUtils.mkQuery(INSERT_ORDER);
const insertOrderDetails = dbUtils.mkQuery(INSERT_ORDER_DETAILS);
const selectUserIdByEmail = dbUtils.mkQueryFromPool(dbUtils.mkQuery(SELECT_USER_ID_BY_EMAIL), pool);

const SELECT_ALL_ORDERS = "select orders.order_id, orders.order_date, users.email, order_detail_id, order_details.product_id, products.description, products.image_url, quantity from orders join order_details on orders.order_id = order_details.order_id join users on users.user_id = orders.user_id join products on products.product_id = order_details.product_id order by orders.order_id;";
const selectAllOrders = dbUtils.mkQueryFromPool(dbUtils.mkQuery(SELECT_ALL_ORDERS), pool);


module.exports = { getAllOrders, createOrder };


function getAllOrders(req, res, next) {
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
}

function createOrder(req, res, next) {
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
            return insertOrder({ connection, params: newOrder })
          })
          .then(status => {
            return insertOrderDetails({ connection, params: [newOrderDetails] });
          })
          .then(dbUtils.commit, dbUtils.rollback)
          .then(
            (status) => { res.status(201).json({ message: "Order created" }) },
            (status) => { res.status(500).json({ message: "Internal server error" }) }
          )
          .finally(() => { connection.release() });
      })
    })
}
