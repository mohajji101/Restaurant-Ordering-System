const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use("/api/admin", require("./routes/admin.routes"));

// Error Handling Middleware (Must be last)
app.use(require("./middleware/error_middleware"));

module.exports = app;
