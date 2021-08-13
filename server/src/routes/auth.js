import express from 'express';
import { X509WalletMixin } from 'fabric-network';
import { getCA, getConnectedWallet, registerUser } from '../utils';
import {createCompany, createInvestor, createValidator, signInToPlatform} from "./platform";

const router = express.Router();

const cookieParser = require('cookie-parser');
router.use(cookieParser());

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
    const ca = getCA();
    const adminData = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'password' });
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

    const userData = await ca.enroll({
      enrollmentID: login,
      enrollmentSecret: password,
    });
    gateway.disconnect();
    console.log(userData.certificate);
    console.log(userData.key.toBytes());
    res.status(201).json({
      login,
      certificate: userData.certificate,
      privateKey: userData.key.toBytes(),
    });
  }
  catch (e) {
    res.status(400).json({ message: e.message });
  }
};


const signIn = async (req, res) => {
  const {certificate, privateKey} = req.body;
  try {
    const userData = await signInToPlatform(certificate, privateKey);
    res.cookie("cert", certificate, {httpOnly: true});
    res.cookie("prKey", privateKey, {httpOnly: true});

    res.status(201).json({
      commonName: userData.commonName,
      fullName: userData.fullName,
      affiliation: userData.affiliation,
      certificate: certificate,
      privateKey: privateKey,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}


router.get('/logout', (req, res)=>{
  res.clearCookie('cert');
  res.clearCookie('prKey');
  res.send('user data deleted from cookie');
});

router.post('/signIn', signIn);
router.post('/investor', signUpInvestor);
router.post('/validator', signUpValidator);
router.post('/company', signUpCompany);
router.post('/systemAdmin', signUpAdmin);

export default router;
