import express from 'express';
import connectToDatabase from './db';
import fs from 'fs/promises';
import { Request, Response } from 'express';
import { Binary } from 'mongodb';
import UserModel from './models/user';
import RestourantModel from './models/restourant';
import ReservationModel from './models/reservation';
import RestourantWaiterModel from './models/restourantWaiter';
import DishModel from './models/dish';
import OrderModel from './models/order';


const app = express();

app.use(express.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  //res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(3000, () => console.log(`Express server running on port 3000`));

const crypto = require('crypto');

// Your secret encryption key (keep this secure)
const secretKey = 'your-secret-key';

// Function to encrypt a password
function encryptPassword(password: any) {
  const cipher = crypto.createCipher('aes-256-cbc', secretKey);
  let encryptedPassword = cipher.update(password, 'utf-8', 'hex');
  encryptedPassword += cipher.final('hex');
  return encryptedPassword;
}

// Function to decrypt a password
function decryptPassword(encryptedPassword: any) {
  const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
  let decryptedPassword = decipher.update(encryptedPassword, 'hex', 'utf-8');
  decryptedPassword += decipher.final('utf-8');
  return decryptedPassword;
}

