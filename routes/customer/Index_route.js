const Account_route = require("./Account_route");

module.exports = (app)=> {
    app.use('/customer', Account_route);
};