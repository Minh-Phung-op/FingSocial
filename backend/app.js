require('dotenv').config(); // Đọc các biến môi trường từ .env
const mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const User = require('./models/User');  // Đảm bảo đường dẫn đúng
const Post = require('./models/Post');  // Đảm bảo đường dẫn đúng
const postsRouter = require('./routes/posts');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const dbURI = "mongodb+srv://phuongnm57:phung211058@mongophung.rg5ni.mongodb.net/FingSocial";
// Kết nối MongoDB Atlas
mongoose.connect(dbURI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

app.use(cors({
    origin: 'http://localhost:3002', // Cho phép từ frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức được phép
    credentials: true, // Nếu có cookie/session
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/posts', postsRouter);
// Set port (cổng mặc định là 3001)
const port = process.env.PORT || 3001; // Nếu không có biến môi trường PORT, cổng mặc định là 3001

app.listen(port, () => {
    console.log(`Server is running on port http:localhost:${port}/`); // In cổng lên cmd 
});

module.exports = app;
