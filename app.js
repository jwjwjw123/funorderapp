var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var productRouter = require('./routes/product');
var orderRouter = require('./routes/order');
var userRouter = require('./routes/user');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'angular-src/dist/angular-src')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/product', productRouter);
app.use('/api/order', orderRouter);
app.use('/api/user', userRouter);

module.exports = app;
