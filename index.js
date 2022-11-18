
const port = 3000
const argon2 = require('argon2');

const express = require('express')
const app = express()
const mongoose = require('mongoose');
const { User } = require("./model/User");
var jwt = require('jsonwebtoken');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/api/auth/login', async (req, res) => { })

app.post('/api/auth/register', async (req, res) => { })

app.get('/api/user/profile', async (req, res) => { })

app.put('/api/user/edit', async (req, res) => { })

app.put('/api/user/edit-password', async (req, res) => { })

app.put('/api/user/edit-phone', async (req, res) => { })

app.put('/api/user/edit-email', async (req, res) => { })

app.delete('/api/user/delete', async (req, res) => { })

const start = async () => {
  try {
    const mongo = await mongoose.connect(
      "mongodb://127.0.0.1:27017/myappdb"
    ).catch(error => console.error(err.reason));
    console.log(mongo)
    app.listen(port, () => console.log("Server started on port 3000"));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();