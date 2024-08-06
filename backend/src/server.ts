import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs/promises';
import { Binary } from 'mongodb';
import connectToDatabase from './db';
// import models
import UserModel from './models/user';
// import utils
import {encryptPassword, decryptPassword} from './libraries/crypto';

const app = express();

// middleware
app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  //res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// upload module
const multer  = require('multer');
const storage = multer.memoryStorage();
const upload  = multer({ storage: storage });

// routes
app.get('/', (req, res) => res.send('Hello World!'));

// user



// server start
app.listen(3000, () => console.log(`Express server running on port 3000`));
