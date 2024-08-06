import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs/promises';
import { Binary } from 'mongodb';
import connectToDatabase from './db';
// import models
import UserModel from './models/user';
import CompanyModel from "./models/company";
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
// get all users sa filterom po tipu korisnika
app.get('/users', async (req, res) => {
  try {

    console.log("get users")
    await connectToDatabase();

    let profileType = req.query.type;
    let count = req.query.count;

    let searchParams = {};

    switch (profileType) {
      case 'vlasnik':
      case 'dekorater':
      case 'admin':
        searchParams = {
          profileType:profileType
        };
        break;
      default:
        // namerno ostavljeno prazno
        break;
    }

    let allUsers = await UserModel.find(
        searchParams
    );

    if(count) {
      res.status(200).json({count:allUsers.length});
      return;
    }

    for(let user of allUsers){
      user.profilePictureUrl = user.profilePicture?.toString('base64');
      user.password = decryptPassword(user.password);
    }

    res.json(allUsers);

  } catch (error) {

    console.error('Error listing users:', error);

    res.status(500).json({ error: 'Internal Server Error' });

  }
});

// get user by:
// username and password
// username
// id
app.post('/users', async (req, res) => {
  try {
    console.log("post userBy")
    await connectToDatabase();

    let username = req.body.username
    let password = req.body.password;
    let id = req.body.id;

    let searchParams = {};

    if(username && password) {
      searchParams = {
        username: username,
        password: password
      };
    } else if(username) {
      searchParams = {
        username: username,
      };
    } else if (id) {
      searchParams = {
        '_id': id,
      };
    } else {
      res.status(400).json({ error: 'No search params' });
    }

    let u = await UserModel.find(searchParams);

    // any results
    if (u.length > 0) {

      let user = u[0]

      user.profilePictureUrl = user.profilePicture?.toString('base64')
      user.password = decryptPassword(user.password)

      res.json({"user": user});

    } else {
      res.status(404).json();
    }

  } catch (error) {
    console.error('Error getting user by username:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// user add/update
app.post('/users/mod', upload.single('file') , async (req, res) => {
  try {
    // Connect to the database
    console.log("post addUser")
    await connectToDatabase();

    //moras npm i @types/multer --save-dev
    //npm i multer
    // da li je slika poslata?
    let profilePicture = null;
    if(req.file){
      profilePicture = req.file.buffer;
    }

    //console.log(file)
    const username = req.body.username;
    const password = encryptPassword(req.body.password);
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const gender = req.body.gender;
    const address = req.body.address;
    const phone = req.body.phone;
    const email = req.body.email;
    const profileType = req.body.profileType;
    const profileStatus = req.body.profileStatus;
    const cardNumber = req.body.cardNumber;
    const company = req.body.company;

    //check if user exist
    let u = await UserModel.findOne({ username: username });

    if(u){
      console.log("changing user")

      // ako je updejt, a nemamo novu sliku ostavi staru
      if(!profilePicture) {
        profilePicture = u.profilePicture;
      }

      await UserModel.updateOne({ username: username}, {$set:{
          username: username,
          password: password,
          profilePicture: profilePicture,
          firstName: firstName,
          lastName: lastName,
          gender: gender,
          address: address,
          phone: phone,
          email: email,
          profileType: profileType,
          profileStatus: profileStatus,
          cardNumber: cardNumber,
          company: company
        }});

      res.status(201).json({ message: 'User changed successfully'});

    } else {

      // ako je insert, a nemamo profilnu sliku
      // preuzmi sliku sa place holder usera
      if(!profilePicture) {

        let u = await UserModel.findOne({ username: "placeHolder"});

        if(u) {
          profilePicture = u.profilePicture;
        }

      }

      await UserModel.create(
        {
          username: username,
          password: password,
          firstName: firstName,
          lastName: lastName,
          gender: gender,
          address: address,
          phone: phone,
          email: email,
          profileType: profileType,
          profileStatus: profileStatus,
          profilePicture: profilePicture,
          cardNumber: cardNumber,
          company: company
        }
      );

      res.status(201).json({ message: 'User created successfully'});

    }

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// change user password
app.post('/users/password', async (req, res) => {
  try {
    // Connect to the database
    console.log("post changePassword")
    await connectToDatabase();

    const username = req.body.username;
    const password = encryptPassword(req.body.oldPassword)
    const newPassword = encryptPassword(req.body.newPassword)

    let u = await UserModel.findOne({ username: username, password: password });

    if(u) {

      await UserModel.updateOne(
          { username: username },
          { $set: {password: newPassword,} }
      );
      res.json(u)

    } else {

      res.status(404).json();

    }

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// company
// get company/companies
// filter by name or id
app.get('/companies', async (req, res) => {

  try {
    await connectToDatabase();

    const cname = req.query.name;
    const cid   = req.query.id;

    let searchParams = {};

    if(cname) {
      searchParams = {
        name: cname
      }
    } else if(cid) {
      searchParams = {
        _id: cid
      }
    }

    let c = await CompanyModel.find(searchParams);

    console.log(c) ;

    if (c.length > 0) {
      res.status(200).json(c);
      return;
    }

    res.status(404).json();

  } catch (error) {
    console.error('Error getting compaines:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// company add/update
app.post('/companies/mod', async (req, res) => {
  try {

    await connectToDatabase();

    const id = req.body.id;
    const name = req.body.name;
    const address = req.body.address;
    const phone = req.body.phone;
    const worktime = req.body.worktime;
    const freeWorkers = req.body.freeWorkers;
    const contactPerson = req.body.contactPerson;
    const vacationStart = req.body.vacationStart;
    const vacationEnd = req.body.vacationEnd;

    if(id) {
      // update
      let c = await CompanyModel.updateOne(
          {'_id': id},
          {$set:
            {
              name: name,
              address: address,
              phone: phone,
              worktime: worktime,
              freeWorkers: freeWorkers,
              contactPerson: contactPerson,
              vacationStart: vacationStart,
              vacationEnd: vacationEnd
            }
          }
      );

      if(c.matchedCount != 0) {
        res.status(201).json({message: 'Company successfully updated'});
      } else {
        res.status(400).json({message: 'Company not updated'});
      }

    } else {
      // insert
      let c = await CompanyModel.findOne({ name: name});

      if(c) {
        res.status(400).json({message: 'Company already exists'});
        return;
      }

      c = await CompanyModel.create(
          {
            name: name,
            address: address,
            phone: phone,
            worktime: worktime,
            freeWorkers: freeWorkers,
            contactPerson: contactPerson,
            vacationStart: vacationStart,
            vacationEnd: vacationEnd
          }
      );

      if(c) {
        res.status(201).json({message: 'Company successfully created'});
      } else {
        res.status(400).json({message: 'Company not created'});
      }

    }

  } catch (error) {
    console.error('Error add/update company:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})



// server start
app.listen(3000, () => console.log(`Express server running on port 3000`));
