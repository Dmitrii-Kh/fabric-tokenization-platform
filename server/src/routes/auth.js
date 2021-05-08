import express from 'express';
import { X509WalletMixin } from 'fabric-network';
import { getCA, getConnectedWallet, registerUser } from '../utils';
import {createCompany, createInvestor, createValidator, signInToPlatform} from "./platform";

const router = express.Router();


const investorRegistration = async (req, res) => {
  return registration(req, res, "investor");
};

const validatorRegistration = async (req, res) => {
  return registration(req, res, "validator");
};

const companyRegistration = async (req, res) => {
  return registration(req, res, "company");
};

const adminRegistration = async (req, res) => {
  return registration(req, res, "systemAdmin");
};

const registration = async (req, res, affiliation) => {
  const { login, password } = req.body;
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
      const res = await createInvestor(gateway, login);
      console.log("Investor created: " + res);
    }

    if(affiliation === "validator") {
      const res = await createValidator(gateway, login);
      console.log("Validator created: " + res);
    }

    if(affiliation === "company") {
      const res = await createCompany(gateway, login);
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
  console.log(certificate)
  console.log(privateKey)
  try {
    const userData = await signInToPlatform(certificate, privateKey);
    console.log("Sign In Success");
    res.status(201).json({
      commonName: userData.commonName,
      affiliation: userData.affiliation,
      certificate: certificate,
      privateKey: privateKey,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

router.post('/signIn', signIn);
router.post('/investor', investorRegistration);
router.post('/validator', validatorRegistration);
router.post('/company', companyRegistration);
router.post('/systemAdmin', adminRegistration);

export default router;
