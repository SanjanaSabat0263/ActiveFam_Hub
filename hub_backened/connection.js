const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = 8010;

const DB_URL = "mongodb://sabatsanju03_db_user:etL0L2Fku5ZfgkD0@ac-9bljmal-shard-00-00.2jeffvk.mongodb.net:27017,ac-9bljmal-shard-00-01.2jeffvk.mongodb.net:27017,ac-9bljmal-shard-00-02.2jeffvk.mongodb.net:27017/activefam?ssl=true&replicaSet=atlas-c1yngb-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(DB_URL);
const conn = mongoose.connection;

conn.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

conn.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process with an error code
});

//route
app.get('/auth', (req, res) => {
    res.json({ message: 'Auth route is working' });
});

