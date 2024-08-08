import express from 'express';
import connectToDatabase from './db';
// import models
import UserModel from './models/user';
import CompanyModel from "./models/company";
import ServiceModel from "./models/service";
import MaintanceModel from "./models/maintance";
import ArrangementModel from "./models/arrangement";
// import utils
import {decryptPassword, encryptPassword} from './libraries/crypto';
import {hashPassword} from "./middleware/hashpassword";
import {ach} from "./middleware/ach";

const app = express();

// middleware
app.use(express.json());
//app.use(hashPassword);
app.use(ach);

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

    const profileType = req.query.type;
    const username = req.query.username;
    const count       = req.query.count;

    let searchParams = {};

    switch (profileType) {
      case 'vlasnik':
      case 'dekorater':
      case 'admin':
        searchParams = { ...searchParams, profileType:profileType };
        break;
      default:
        // namerno ostavljeno prazno
        break;
    }

    if(username) {
      searchParams = { ...searchParams, username: username };
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
app.post('/users', hashPassword, async (req, res) => {
  try {
    console.log("post userBy")

    await connectToDatabase();

    let username = req.body.username;
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
      return;
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
app.post('/users/mod', hashPassword, upload.single('file') , async (req, res) => {
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
    const password = req.body.password;
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

    if(u) {
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
    console.error('Error add/update users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// change user password
app.post('/users/password', hashPassword, async (req, res) => {
  try {
    // Connect to the database
    console.log("post changePassword")
    await connectToDatabase();

    const username = req.body.username;
    const password = req.body.oldPassword;
    const newPassword = req.body.newPassword;

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
});

app.post('/companies', async (req, res) => {

  const companyData = req.body;

  try {

    await connectToDatabase();

    const data = new CompanyModel(companyData);

    let c = await data.save();

    if(c) {
      res.status(201).json({message: 'Company successfully created'});
    } else {
      res.status(400).json({message: 'Company not created'});
    }

  } catch (error) {

    console.error('Error add company:', error);
    res.status(500).json({ error: 'Internal Server Error' });

  }

});

app.patch('/companies', async (req, res) => {

  const name = req.body.name;
  const dataCompany = req.body;

  try {

    await connectToDatabase();

    const c = await CompanyModel.findOneAndUpdate({name: name}, dataCompany);

    if(c) {
      res.status(204).json({message: 'Company successfully updated'});
    } else {
      res.status(400).json({message: 'Company not updated'});
    }

  } catch (error) {

    console.error('Error update company:', error);
    res.status(500).json({ error: 'Internal Server Error' });

  }

});

// service
// get services
app.get('/services', async (req, res) => {

  try {
    await connectToDatabase();

    const cname = req.query.name;
    const ccompany = req.query.company;
    const cid = req.query.id;

    let searchParams = {};

    if(cid) {
      searchParams = {...searchParams, '_id': cid };
    } else {

      if (cname) {
        searchParams = {...searchParams, name: cname};
      }

      if (ccompany) {
        searchParams = {...searchParams, company: ccompany};
      }

    }

    let c = await ServiceModel.find(searchParams);

    console.log(c) ;

    if (c.length > 0) {
      res.status(200).json(c);
      return;
    }

    res.status(404).json();

  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// add service
app.post('/services', async (req, res) => {

  const serviceData = req.body;

  try {

    await connectToDatabase();

    const service = new ServiceModel(serviceData);

    const c = await service.save();

    if(c) {
      res.status(201).json(c);
    } else {
      res.status(400).json();
    }

  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// update service
app.patch('/services', async (req, res) => {

  const serviceData = req.body;
  const serviceID = req.body.id;

  try {
    await connectToDatabase();

    const c = await ServiceModel.findOneAndUpdate({'_id' : serviceID}, serviceData);

    if(c){
      res.status(204).json();
    } else {
      res.status(400).json();
    }

  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }


});

//  maintenance
// get  maintenances
app.get('/maintenances', async (req, res) => {

  const muser = req.query.user;
  const mstatus = req.query.status;
  const mid   = req.query.id;
  const mfrom = req.query.from;
  const mto   = req.query.to;
  const mdate   = req.query.date;

  try {

    await connectToDatabase();

    let searchParams = {};

    if(mid) {
      searchParams = {...searchParams, '_id': mid };
    } else {

      if (muser) {
        searchParams = {...searchParams, user: muser};
      }

      if (mstatus) {
        searchParams = {...searchParams, status: mstatus};
      }

      if(mdate && (mfrom || mto)) {
        // find({ lastDate|nextDate: { $gte: '1987-10-19', $lte: '1987-10-26' } }).
        const dateQuery: { [key:string]: object } = {};

        if(mfrom && mto) {
          dateQuery[mdate+'Date'] = { $gte : mfrom, $lte: mto };
        } else if (mfrom) {
          dateQuery[mdate+'Date'] = { $gte : mfrom };
        } else if (mto) {
          dateQuery[mdate+'Date'] = { $lte: mto };
        }

        searchParams = {...searchParams, ...dateQuery};
      }

    }

    let c = await MaintanceModel.find(searchParams);

    console.log(c) ;

    if (c.length > 0) {
      res.status(200).json(c);
      return;
    }

    res.status(404).json();

  } catch (error) {
    console.error('Error getting maintenances:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// add maintenance
app.post('/maintenances', async (req, res) => {

  try {

    const maintenanceData = req.body;

    await connectToDatabase();

    const data = new MaintanceModel(maintenanceData);

    let m = await data.save();

    if(m){
      res.status(201).json(m);

    } else {
      res.status(400).json();
    }

  } catch (error) {
    console.error('Error add maintenance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// update maintenance
app.patch('/maintenances', async (req, res) => {

  try {

    const mtenanceData = req.body;
    const mtenanceID = req.body.id;

    await connectToDatabase();

    let m = await MaintanceModel.findOneAndUpdate({'_id' : mtenanceID}, mtenanceData);

    if(m){
      res.status(204).json();
    } else {
      res.status(400).json();
    }

  } catch (error) {
    console.error('Error add maintenance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// arrangements
// get arrangements
app.get('/arrangements', async (req, res) => {

  try {
    const auser = req.query.user;
    const adecorator = req.query.decorator;
    const acompany = req.query.company;

    await connectToDatabase();

    let searchParams = {};

    //build search params
    if(auser){
      searchParams = {...searchParams, user: auser}
    }

    if(adecorator){
      searchParams = {...searchParams, decorator: adecorator}
    }

    if(acompany) {
      searchParams = {...searchParams, company: acompany}
    }

    const a = await ArrangementModel.find(searchParams);

    if(a) {
      res.status(200).json(a);
    } else {
      res.status(404).json();
    }

  } catch (error) {
    console.error('Error get arragements:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// add arrangement
app.post('/arrangements', async (req, res) => {

  try {
    await connectToDatabase();

    const arragementData = req.body;

    const arrangement = new ArrangementModel(arragementData);
    const a = await arrangement.save();
    if(a){
      res.status(201).json(a);
    } else {
      res.status(400).json();
    }

  } catch (error) {
    console.error('Error add arrangement:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// update arrangement
app.patch('/arrangements', async (req, res) => {

  try {
    await connectToDatabase();

    const arragementID = req.body.id;
    const arragementData = req.body

    const a = await ArrangementModel.findOneAndUpdate({'_id' : arragementID}, arragementData);

    if(a){
      res.status(204).json();
    } else {
      res.status(400).json();
    }

  } catch (error) {
    console.error('Error update arrangement:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

/*

// auth
app.post('/auth/register', async (req, res) => {
  const userData = req.body;

  try {
    await connectToDatabase();

    const u = await UserModel.findOne({email: userData.email});

    if (u) {
      res.status(400).json({'message': 'Email already taken'});
    } else {
      const hashedPassword = await encryptPassword(userData.password);
      const user = await UserModel.create({
        ...userData,
        password: hashedPassword,
      });

      user.password = undefined;

      res.status(201).json(user);
    }
  } catch (error) {
    console.error('Error add maintenance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/auth/login', hashPassword, async (req, res) => {
  const loginData = req.body;

  await connectToDatabase();

  let searchParams = {};

  if(loginData.email) {
    searchParams = {...searchParams, email: loginData.email}
  } else if (loginData.username) {
    searchParams = {...searchParams, username: loginData.username}
  } else {
    res.status(400).json();
    return;
  }

  const user = await UserModel.findOne(searchParams);

  if (user) {
    const isPasswordMatching = loginData.password.compare(user.password);

    if (isPasswordMatching) {
      user.password = undefined;
      res.status(200).json(user);
    } else {
      res.status(403).json();
    }
  } else {
    res.status(401).json();
  }
});

*/

// ------------
// server start
// ------------
app.listen(3000, () => console.log(`Express server running on port 3000`));
