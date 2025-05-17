const Account_controller = require("../../controllers/customer/Account_controller");
const MiddlewareAuth = require("../../middleware/customer/auth")
const express = require("express");
const app = express();


app.post("/login", Account_controller.loginController);
app.get('/fetch_category', Account_controller.categoryFectch);
app.get('/fetch_product_with_category', Account_controller.productFecth);
app.get('/search_product', Account_controller.searchProducts);

app.post('/create_order', Account_controller.createOrder);
app.post('/pay_order', Account_controller.payOrder);

module.exports = app;