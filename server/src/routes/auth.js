import express from 'express';
import { X509WalletMixin } from 'fabric-network';
import { getCA, getConnectedWallet, registerUser } from '../utils';
import {createCompany, createInvestor, createValidator, signInToPlatform} from "./platform";
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const router = express.Router();
const CryptoJS = require("crypto-js");

const cookieParser = require('cookie-parser');
router.use(cookieParser());

const User = require("../model/user");

const signUpInvestor = async (req, res) => {
  return signUp(req, res, "investor");
};

const signUpValidator = async (req, res) => {
  return signUp(req, res, "validator");
};

const signUpCompany = async (req, res) => {
  return signUp(req, res, "company");
};

const signUpAdmin = async (req, res) => {
  return signUp(req, res, "systemAdmin");
};

const signUp = async (req, res, affiliation) => {
  const { login, fullName, password } = req.body;
  try {
    const oldUser = await User.findOne({ uid: login });

    if (oldUser) {
      return res.status(409).json({ message: "User already exists! PLease login!" });
    }

    const ca = getCA();
    const adminData = await ca.enroll({ enrollmentID: process.env.ADMIN_ENROLLMENT_ID, enrollmentSecret: process.env.ADMIN_ENROLLMENT_SECRET });
    const mixin = X509WalletMixin.createIdentity(
      'Org1MSP',
      adminData.certificate,
      adminData.key.toBytes()
    );
    const gateway = await getConnectedWallet('Org1MSP', mixin);
    const admin = await gateway.getCurrentIdentity()
    await registerUser(ca, admin, { login, password, affiliation: affiliation });

    //createEntity call
    if(affiliation === "investor") {
      const res = await createInvestor(gateway, login, fullName);
      console.log("Investor created: " + res);
    }

    if(affiliation === "validator") {
      const res = await createValidator(gateway, login, fullName);
      console.log("Validator created: " + res);
    }

    if(affiliation === "company") {
      const res = await createCompany(gateway, login, fullName);
      console.log("Company created: " + res);
    }


    // Issue cert and prKey
    const userData = await ca.enroll({
      enrollmentID: login,
      enrollmentSecret: password,
    });

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);
    const encryptedPublic = await CryptoJS.AES.encrypt(userData.certificate, process.env.AES_SECRET_KEY).toString();
    const encryptedPrivate =  await CryptoJS.AES.encrypt(userData.key.toBytes(), process.env.AES_SECRET_KEY).toString();

    // Create token
    const token = jwt.sign(
        { uid: login },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
    );


    // Create user in our database
    const user = await User.create({
      uid: login,
      password: encryptedPassword,
      public_key: encryptedPublic,
      private_key: encryptedPrivate,
      token: token
    });


    // save user token
    // user.token = token;

    gateway.disconnect();
    console.log(userData.certificate);
    console.log(userData.key.toBytes());

    res.status(201).json(user);
  }
  catch (e) {
    res.status(400).json({ message: e.message });
  }
};


const signIn = async (req, res) => {
  const {login, password} = req.body;
  try {
    const user = await User.findOne({ uid: login });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
          { uid: user.uid },
          process.env.TOKEN_KEY,
          {
            expiresIn: "1h",
          }
      );

      // save user token
      user.token = token;

      // get cert + private key
      const certificate  = await CryptoJS.AES.decrypt(user.public_key, process.env.AES_SECRET_KEY).toString(CryptoJS.enc.Utf8);
      const privateKey  = await CryptoJS.AES.decrypt(user.private_key, process.env.AES_SECRET_KEY).toString(CryptoJS.enc.Utf8);

      const userData = await signInToPlatform(certificate, privateKey);

      res.cookie("x-access-token", token, {httpOnly: true});
      // res.cookie("cert", certificate, {httpOnly: true});
      // res.cookie("prKey", privateKey, {httpOnly: true});

      res.status(201).json({
        commonName: userData.commonName,
        fullName: userData.fullName,
        affiliation: userData.affiliation,
        certificate: certificate,
        privateKey: privateKey,
      });

    }

    res.status(400).json({ message: "Invalid Credentials!" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}


router.get('/logout', (req, res)=>{
  // res.clearCookie('cert');
  // res.clearCookie('prKey');
  res.clearCookie('x-access-token');
  res.send('user data deleted from cookie');
});

router.post('/signIn', signIn);
router.post('/investor', signUpInvestor);
router.post('/validator', signUpValidator);
router.post('/company', signUpCompany);
router.post('/systemAdmin', signUpAdmin);

export default router;
