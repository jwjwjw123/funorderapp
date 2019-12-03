require('dotenv').config();
const mysql = require('mysql');
const passport = require('passport');

const dbUtils = require('../utils/database.utils');
const dbConfig = require('../config/database.config');

const pool = mysql.createPool(dbConfig);

// SQl statements
const SELECT_USER_BY_EMAIL_PASSWORD = 'select * from users where email = ? and password = sha2(?, 256)';
const findUserByEmailPassword = dbUtils.mkQueryFromPool(dbUtils.mkQuery(SELECT_USER_BY_USER_ID));

const SELECT_USER_BY_USER_ID = 'select * from users where user_id = ?';
const findUserById = dbUtils.mkQueryFromPool(dbUtils.mkQuery(SELECT_USER_BY_USER_ID, pool));

const authenticateUser = (params) => {
  const { email, password } = params;
  return new Promise((resolve, reject) => {
    findUserByEmailPassword([email, password])
      .then(result => {
        if (result.length > 0) {
          resolve(result[0]);
        }
        reject(false);
      })
  })
};


const getUserById = (user_id) => {
  return new Promise((resolve, reject) => {
    findUserById([user_id])
      .then(
        result => {
          if (result.length > 0) {
            console.log(result);
            resolve(result[0]);
          }
          reject("User not found");
        })
  })
};


module.exports = { authenticateUser, getUserById };