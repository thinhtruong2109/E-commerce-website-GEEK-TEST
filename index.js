const express = require('express');
const app = express();
const port = 3000;
const {sequelize, connect} = require('./config/database');
const User = require('./models/User.js');
const Account = require('./models/Account.js');
const Catergory = require('./models/Category.js');
const Order = require('./models/Order.js');
const OrderFeesDiscount = require('./models/OrderFeesDiscount.js');
const OrderItem = require('./models/OrderItem.js');
const Product = require('./models/Product.js');
const ProductVariant = require('./models/ProductVariant.js');
const UserVoucher = require('./models/UserVoucher.js');
const Voucher = require('./models/Voucher.js');


require('dotenv').config();



app.use(express.json());

connect();// ket noi db



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}
);

app.get('/', (req, res) => {
  res.send('initial of project!');
}
);


app.get('/getTest', async (req, res) => {
  try {
    const users = await Voucher.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});