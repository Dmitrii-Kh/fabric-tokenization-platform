import express from 'express';
import {X509WalletMixin} from 'fabric-network';
import {getCA, getConnectedWallet, sendTransaction} from '../utils';
import fs from "fs";

const router = express.Router();


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

export const createInvestor = async (gateway, investorFullName) => {
    try {
        const result = await sendTransaction(gateway, {
            name: 'createInvestor',
            props: [investorFullName]
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

export const createValidator = async (gateway, validatorFullName) => {
    try {
        const result = await sendTransaction(gateway, {
            name: 'createValidator',
            props: [validatorFullName]
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


export const createCompany = async (gateway, companyName) => {
    try {
        const result = await sendTransaction(gateway, {
            name: 'createCompany',
            props: [companyName]
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
        return result;
    } catch (e) {
        console.log(e);
    }
};

// *************************************************

const createNewProject = async (req, res) => {
    const {certificate, privateKey, projectName, projectDescription, totalSupply, tokenName, priceInUSDT} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
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
    const {certificate, privateKey} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
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
    const {certificate, privateKey, investorFullName, currency, amount} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'depositInvestor',
            props: [investorFullName, currency, amount]
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};

const depositCompanyProject = async (req, res) => {
    const {certificate, privateKey, companyName, projectName, currency, amount} = req.body;

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'depositCompanyProject',
            props: [companyName, projectName, currency, amount]
        })
        gateway.disconnect()
        res.status(201).json({data: result})
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getInvestorWallet = async (req, res) => {
    let {certificate, privateKey, investorFullName} = req.body;
    investorFullName = investorFullName || "";
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getInvestorWallet',
            props: [investorFullName]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getValidatorWallet = async (req, res) => {
    let {certificate, privateKey, validatorFullName} = req.body;
    validatorFullName = validatorFullName || ""
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getValidatorWallet',
            props: [validatorFullName]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getValidatorApprovals = async (req, res) => {
    let {certificate, privateKey, validatorFullName} = req.body;
    validatorFullName = validatorFullName || "";
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getValidatorApprovals',
            props: [validatorFullName]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getProjectWallet = async (req, res) => {
    let {certificate, privateKey, projectName, companyName} = req.body;
    companyName = companyName || ""
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getProjectWallet',
            props: [projectName, companyName]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getProject = async (req, res) => {
    let {certificate, privateKey, projectName, companyName} = req.body;
    companyName = companyName || ""
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'getProject',
            props: [projectName, companyName]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const approveProject = async (req, res) => {
    let {certificate, privateKey, projectName, companyName} = req.body;

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'approveProject',
            props: [projectName, companyName]
        })
        gateway.disconnect()
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getInvestors = async (req, res) => {
    let {certificate, privateKey} = req.body;

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
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
    let {certificate, privateKey} = req.body;

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
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
    let {certificate, privateKey, investorFullName, companyName, projectName, currency, amount} = req.body;

    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
        const gateway = await getConnectedWallet('Org1MSP', mixin);
        const result = await sendTransaction(gateway, {
            name: 'investToProject',
            props: [investorFullName, companyName, projectName, currency, amount]
        })
        gateway.disconnect()
        //res.status(201).json(result)


        const { createCanvas } = require('canvas');

        const width = 1200
        const height = 630

        const canvas = createCanvas(width, height)
        const context = canvas.getContext('2d')

        context.fillStyle = '#000'
        context.fillRect(0, 0, width, height)

        context.font = 'bold 15pt Menlo'
        context.textAlign = 'center'
        context.textBaseline = 'top'
        //context.fillStyle = '#3574d4'
        context.fillStyle = '#fff'

        const text = "This certificate approves that";
        const text2 = `${investorFullName} successfully invested ${amount}${currency} in ${companyName}, ${projectName}`;
        const text3 = `Transaction ID: ${result.data}`;

        context.fillText(text, 600, 170)
        context.fillText(text2, 600, 200)
        context.fillText(text3, 600, 260)


        context.font = 'bold 20pt Menlo'
        context.fillText('{tokenizationPlatformName}', 600, 530)
        const buffer = canvas.toBuffer('image/jpeg')

        fs.writeFileSync('./investCert.jpeg', buffer)

        res.download("./investCert.jpeg");

    } catch (e) {
        res.status(400).json({message: e.message});
    }
};


const getCompanyTotalInvestments = async (req, res) => {
    const {certificate, privateKey} = req.body;
    try {
        const mixin = X509WalletMixin.createIdentity('Org1MSP', certificate, privateKey)
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



router.get('/getInvestorsData', getInvestorsData);
router.get('/getValidatorsData', getValidatorsData);
router.get('/getCompaniesData', getCompaniesData);

router.post('/getInvestorWallet', getInvestorWallet);
router.post('/getValidatorWallet', getValidatorWallet);
router.post('/getProjectWallet', getProjectWallet);

router.post('/getProject', getProject);

router.post('/createNewProject', createNewProject);
router.post('/getAllProjects', getAllProjects);

router.post('/depositInvestor', depositInvestor);
router.post('/depositCompanyProject', depositCompanyProject);

router.post('/approveProject', approveProject);

router.post('/getInvestors', getInvestors);
router.post('/getValidators', getValidators);

router.post('/investToProject', investToProject);

router.post('/getValidatorApprovals', getValidatorApprovals);

router.post('/getCompanyTotalInvestments', getCompanyTotalInvestments);


export default router;
