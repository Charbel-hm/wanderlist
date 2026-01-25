const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// DB Config
const db = process.env.MONGO_URI || 'mongodb://localhost:27017/wanderlist';

// Connect to Mongo
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/wiki', require('./routes/wiki'));
app.use('/api/wanderlist', require('./routes/wanderlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/game', require('./routes/game'));
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
