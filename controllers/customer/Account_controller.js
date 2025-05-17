const Account = require('../../models/Account.js');
const Category = require('../../models/Category.js');
const Product = require('../../models/Product.js');
const ProductVariant = require('../../models/ProductVariant.js');
const Order = require('../../models/Order.js');
const OrderItem = require('../../models/OrderItem.js');
const OrderFeesDiscount = require('../../models/OrderFeesDiscount.js');
const sequelize = require('../../config/database').sequelize;
const User = require('../../models/User.js');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
require('dotenv').config();
const secret = process.env.JWT_SECRET; 
const nodemailer = require('nodemailer');



async function sendOrderConfirmationEmail(to, orderId) {
  // Cấu hình transporter (ví dụ SMTP)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use false for STARTTLS; true for SSL on port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  const info = await transporter.sendMail({
    from: '"E-Shop" <no-reply@eshop.com>',
    to,
    subject: `Xác nhận đơn hàng #${orderId}`,
    html: `<p>Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn (#${orderId}) đã được ghi nhận.</p>`
  });

  console.log('Email sent:', info.messageId);
}



module.exports.loginController = async (req, res) => {
  const userAgent = req.headers['user-agent'];
  if(!userAgent){
    res.json({
      "code": "error",
      "msg": "Lỗi không có user agent"
    })
    return
  }

    if (!req.body) {
    return res.status(400).json({
        code: "error",
        msg: "Không có dữ liệu gửi lên (body rỗng hoặc sai định dạng)"
    });
    }

  if (!req.body.username){
    res.json({
      code: "Bạn chưa nhập tên tài khoản"
    })
    return
  }
  if (!req.body.password){
    res.json({
      code: "Bạn chưa nhập mật khẩu"
    })
    return
  }


  const username = req.body.username
  const password = req.body.password

  console.log("username: ", username)
  console.log("password: ", password)
  const account = await Account.findOne({
    where: { username: username }
  })
  if(!username){
    res.json({
      code: "Bạn chưa nhập tên tài khoản"
    })
    return
  }
  if(!account){
    res.json({
      code: "Tài khoản không tồn tại"
    })
    return
  }

  console.log("username account: ", account.username)
  console.log("password account: ", account.password_hash)
  if(md5(password) != account.password_hash){
    res.json({
      code: "Mật khẩu không đúng"
    })
    return
  }
  const token = jwt.sign(
  {
    accountToken: {
      "id": account.id,
      "user_id": account.user_id,
      "username": account.username,
      "role": account.role,
      "key": md5(userAgent)
    }
  }, secret, { expiresIn: '30m' });
  const rftoken = jwt.sign(
  {
    token: token,
    id: account.id
  }, secret, { expiresIn: '168h' });
  res.json({
    code: "success",
    role: account.role,
    token: token,
    rftoken: rftoken
  })
}

module.exports.categoryFectch = async (req, res) => {
    try {
        const category = await Category.findAll();
        res.json(category);
    } catch (error) {
        console.error('Error fetching Category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports.productFecth = async (req, res) => {
    try {
        const { category_id } = req.query;
        if (!category_id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }
    console.log("category_id: ", category_id)
    const products = await Product.findAll({
      where: {
        category_id: category_id 
      }
    });

    res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching Product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports.searchProducts = async (req, res) => {
  try {
    const { keyword, color, size } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required for full-text search' });
    }

    // Step 1: Tìm product có tên chính xác (case insensitive)
    const product = await Product.findOne({
      where: {
        name: { [Op.iLike]: keyword }  // tìm đúng tên (case insensitive)
      },
      attributes: ['id', 'name', 'category_id', 'base_price']
    });

    if (!product) {
      // Không tìm thấy product nào
      return res.status(200).json([]);
    }

    // Step 2: Tìm variant thỏa mãn điều kiện trong product_id tìm được

    const variantWhere = { product_id: product.id };
    if (color) variantWhere.color = color;
    if (size) variantWhere.size = size;

    console.log ("product_id: ", product.id)
    console.log ("color: ", color)  
    console.log ("size: ", size)

    const variants = await ProductVariant.findAll({
      where: variantWhere,
      attributes: ['id', 'product_id', 'size', 'color', 'stock_quantity']
    });

    // Trả về product kèm variants
    return res.status(200).json({
      ...product.toJSON(),
      variants: variants
    });

  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports.createOrder = async (req, res) => {
  const { user_id, cart } = req.body;

  if (!user_id || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const t = await sequelize.transaction(); // Bắt đầu transaction

  try {
    let totalAmount = 0;
    const cartDetails = [];

    // Tính tổng tiền và lấy dữ liệu chi tiết cart
    for (const item of cart) {
      const { product_variant_id, quantity } = item;

      const variant = await ProductVariant.findByPk(product_variant_id, { transaction: t });
      if (!variant) {
        await t.rollback();
        return res.status(400).json({ error: `Product variant ${product_variant_id} not found` });
      }

      const product = await Product.findByPk(variant.product_id, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(400).json({ error: `Product ${variant.product_id} not found` });
      }

      const price = parseFloat(product.base_price);
      totalAmount += price * quantity;

      cartDetails.push({
        product_variant_id,
        quantity,
        price
      });
    }

    // Tạo đơn hàng trong transaction
    const order = await Order.create({
      user_id,
      total_amount: totalAmount,
      created_at: new Date()
    }, { transaction: t });

    // Tạo các OrderItem trong transaction
    for (const item of cartDetails) {
      await OrderItem.create({
        order_id: order.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price: item.price
      }, { transaction: t });
    }

    // Commit transaction nếu không lỗi
    await t.commit();

    // Trả response ngay sau khi commit thành công
    res.status(201).json({
      message: 'Order created successfully. Confirmation email will be sent.',
      order_id: order.id
    });

    // Gửi email fire-and-forget, không trong transaction
    try {
      const user = await User.findByPk(user_id);
      if (user && user.email) {
        await sendOrderConfirmationEmail(user.email, order.id);
      } else {
        console.warn(`User ${user_id} not found or missing email.`);
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

  } catch (error) {
    // Nếu lỗi, rollback transaction
    if (t) await t.rollback();
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports.payOrder = async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const t = await sequelize.transaction();//được tạo để bảo đảm tính toàn vẹn của dữ liệu trong các thao tác liên quan đến cơ sở dữ liệu. Nếu có lỗi xảy ra trong quá trình thực hiện các thao tác này, bạn có thể rollback (hoàn tác) tất cả các thay đổi đã thực hiện trong transaction đó.
  try {
    // lấy tất cả orders của user
    const orders = await Order.findAll({ where: { user_id }, transaction: t });
    if (orders.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'No orders found for this user' });
    }
    const orderIds = orders.map(o => o.id);
    console.log("orders: ", orders)
    console.log("orderIds: ", orderIds)

    // lấy tất cả order_items
    const orderItems = await OrderItem.findAll({ where: { order_id: orderIds }, transaction: t });
    if (orderItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'No order items to process' });
    }

    // kiểm tra tồn kho
    const insufficient = [];
    for (const item of orderItems) {
      const variant = await ProductVariant.findByPk(item.product_variant_id, { transaction: t });
      if (!variant || variant.stock_quantity < item.quantity) {
        insufficient.push({
          product_variant_id: item.product_variant_id,
          available: variant ? variant.stock_quantity : 0,
          requested: item.quantity
        });
      }
    }
    if (insufficient.length) {
      await t.rollback();
      return res.status(400).json({
        error: 'Insufficient stock for some items',
        details: insufficient
      });
    }

    // trừ tồn kho
    for (const item of orderItems) {
      await ProductVariant.update(
        { stock_quantity: sequelize.literal(`stock_quantity - ${item.quantity}`) },
        { where: { id: item.product_variant_id }, transaction: t }
      );
    }

    // xóa order_fees_discounts liên quan
    await OrderFeesDiscount.destroy({
      where: { order_id: orderIds },
      transaction: t
    });

    // xóa order_items
    await OrderItem.destroy({
      where: { order_id: orderIds },
      transaction: t
    });

    // xóa orders
    await Order.destroy({
      where: { id: orderIds },
      transaction: t
    });

    await t.commit();
    return res.status(200).json({ message: 'Payment processed, stock updated, all orders cleared.' });
  } catch (error) {
    await t.rollback();
    console.error('Error processing payment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};