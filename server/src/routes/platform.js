import express from 'express';
import {X509WalletMixin} from 'fabric-network';
import {getCA, getConnectedWallet, sendTransaction} from '../utils';
import fs from "fs";

const router = express.Router();

const cookieParser = require('cookie-parser');
router.use(cookieParser());

const CryptoJS = require("crypto-js");
const User = require("../model/user");
const auth = require("../middleware/auth");

const getUserKeys = async ({uid}) => {
    let user = await User.findOne({uid: uid});
    const certificate  = await CryptoJS.AES.decrypt(user.public_key, process.env.AES_SECRET_KEY).toString(CryptoJS.enc.Utf8);
    const privateKey  = await CryptoJS.AES.decrypt(user.private_key, process.env.AES_SECRET_KEY).toString(CryptoJS.enc.Utf8);

    return {certificate, privateKey};
}

export const createWireframe = async () => {
    try {
        const ca = getCA();
        const adminData = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'password' });
        const mixin = X509WalletMixin.createIdentity(
            'Org1MSP',
            adminData.certificate,
            adminData.key.toBytes()
        );
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'createWireframe',
            props: []
        })
        gateway.disconnect()
        return result;
    } catch (e) {
        console.log(e);
    }
};




// ***** INVESTOR *****

export const createInvestor = async (gateway, investorUID, investorFullName) => {
    try {
        const result = await sendTransaction(gateway, {
            name: 'createInvestor',
            props: [investorUID, investorFullName]
        })
        gateway.disconnect()
        return result;
    } catch (e) {
        console.log(e);
    }
};

//todo For testing purposes in postman, remove before production
const getInvestorsData = async (req, res) => {
    const {certificate, privateKey} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getInvestorsData',
            props: []
        })
        gateway.disconnect()
        res.status(201).json({investors: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};

// ***** VALIDATOR *****

export const createValidator = async (gateway, validatorUID, validatorFullName) => {
    try {
        const result = await sendTransaction(gateway, {
            name: 'createValidator',
            props: [validatorUID, validatorFullName]
        })
        gateway.disconnect()
        return result;
    } catch (e) {
        console.log(e);
    }
};

//todo For testing purposes in postman, remove before production
const getValidatorsData = async (req, res) => {
    const {certificate, privateKey} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getValidatorsData',
            props: []
        })
        gateway.disconnect()
        res.status(201).json({validators: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


// ***** COMPANY *****


export const createCompany = async (gateway, companyUID, companyName) => {
    try {
        const result = await sendTransaction(gateway, {
            name: 'createCompany',
            props: [companyUID, companyName]
        })
        gateway.disconnect()
        return result;
    } catch (e) {
        console.log(e);
    }
};


//todo For testing purposes in postman, remove before production
const getCompaniesData = async (req, res) => {
    const {certificate, privateKey} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getCompaniesData',
            props: []
        })
        gateway.disconnect()
        res.status(201).json({companies: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};

// **********************************************


export const signInToPlatform = async (certificate, privateKey) => {
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'signInToPlatform',
            props: []
        })
        gateway.disconnect()
        console.log(result)
        return result;
    } catch (e) {
        console.log(e);
    }
};

// *************************************************

const createNewProject = async (req, res) => {
    const {projectName, projectDescription, totalSupply, tokenName, priceInUSDT} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'createNewProject',
            props: [projectName, projectDescription, totalSupply, tokenName, priceInUSDT]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getAllProjects = async (req, res) => {
    let {certificate: cert, privateKey: prKey} = await getUserKeys(req.user)
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', cert, prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getAllProjects',
            props: []
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};



const depositInvestor = async (req, res) => {
    const {investorUID, currency, amount} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'depositInvestor',
            props: [investorUID, currency, amount]
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};

const depositCompanyProject = async (req, res) => {
    const {companyUID, projectName, currency, amount} = req.body;

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'depositCompanyProject',
            props: [companyUID, projectName, currency, amount]
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getInvestorWallet = async (req, res) => {
    let {certificate: cert, privateKey: prKey} = await getUserKeys(req.user)
    let {investorUID} = req.body;
    investorUID = investorUID || ""
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', cert, prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getInvestorWallet',
            props: [investorUID]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getValidatorWallet = async (req, res) => {
    let { validatorUID } = req.body;
    validatorUID = validatorUID || ""
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getValidatorWallet',
            props: [validatorUID]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getValidatorApprovals = async (req, res) => {
    let {validatorUID} = req.body;
    validatorUID = validatorUID || "";
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getValidatorApprovals',
            props: [validatorUID]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getProjectWallet = async (req, res) => {
    let {projectName, companyUID} = req.body;
    companyUID = companyUID || ""
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getProjectWallet',
            props: [projectName, companyUID]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getProject = async (req, res) => {
    let {certificate: cert, privateKey: prKey} = await getUserKeys(req.user)
    let {projectName, companyUID} = req.body;
    companyUID = companyUID || ""
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', cert, prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getProject',
            props: [projectName, companyUID]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const approveProject = async (req, res) => {
    let {projectName, companyUID} = req.body;

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'approveProject',
            props: [projectName, companyUID]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getInvestors = async (req, res) => {

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getInvestors',
            props: []
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getValidators = async (req, res) => {

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getValidators',
            props: []
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const investToProject = async (req, res) => {
    let {companyUID, projectName, currency, amount} = req.body;
    let {certificate: cert, privateKey: prKey} = await getUserKeys(req.user)

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', cert, prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'investToProject',
            props: [companyUID, projectName, currency, amount]
        })
        gateway.disconnect()

        const { createCanvas, loadImage  } = require('canvas');

        const width = 1600
        const height = 1081

        const canvas = createCanvas(width, height)
        const context = canvas.getContext('2d')

        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)

        // const image = await loadImage('./CertTemplate.jpeg');

        loadImage('./src/public/images/Green-money-1600px.jpg').then(image => {
            context.drawImage(image, 0,0);
            context.fillStyle = "rgba(0, 0, 0, 0.4)";
            context.fillRect(0, 0, 1600, 1081);

            context.font = 'bold 22pt Menlo'
            context.textAlign = 'center'
            context.textBaseline = 'top'
            context.fillStyle = '#ffffff'

            const text = "This certificate approves that";
            const text2 = `${result.investorFullName} successfully invested ${amount} ${currency} in ${result.companyName}, ${projectName}`;
            const text3 = `Transaction ID: ${result.transactionId}`;

            context.fillText(text, 800, 170)
            context.fillText(text2, 800, 250)
            context.fillText(text3, 800, 330)


            context.font = 'bold 30pt Menlo'
            context.fillText('{Get Tokenized}', 800, 730)
            const buffer = canvas.toBuffer('image/jpeg')

            fs.writeFileSync('./investCert.jpeg', buffer)

            res.download("./investCert.jpeg");
        })


    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getCompanyTotalInvestments = async (req, res) => {

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'companyTotalInvestments',
            props: []
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};



const getInvestmentHistory = async (req, res) => {

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', req.cookies.cert, req.cookies.prKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getInvestmentHistory',
            props: []
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


router.get('/getInvestorsData', getInvestorsData);
router.get('/getValidatorsData', getValidatorsData);
router.get('/getCompaniesData', getCompaniesData);

router.post('/getInvestorWallet', auth, getInvestorWallet);
router.post('/getValidatorWallet', getValidatorWallet);
router.post('/getProjectWallet', getProjectWallet);

router.post('/getProject', auth, getProject);

router.post('/createNewProject', createNewProject);
router.get('/getAllProjects', auth, getAllProjects);

router.post('/depositInvestor', depositInvestor);
router.post('/depositCompanyProject', depositCompanyProject);

router.post('/approveProject', approveProject);

router.get('/getInvestors', getInvestors);
router.get('/getValidators', getValidators);

router.post('/investToProject', auth, investToProject);

router.post('/getValidatorApprovals', getValidatorApprovals);

router.post('/getCompanyTotalInvestments', getCompanyTotalInvestments);
router.get('/getInvestmentHistory', getInvestmentHistory);


export default router;
